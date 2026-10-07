---
title: DLCV 学习笔记：从 CNN 到目标检测与度量学习
date: 2026-10-07
updated: 2026-10-07
slug: dlcv-notes
categories:
  - 学习笔记
  - 计算机视觉
tags:
  - 深度学习
  - CNN
  - ResNet
  - 目标检测
  - 度量学习
  - ReID
description: 从卷积的尺寸与感受野出发，串起网络训练、检测分割、人脸识别与 ReID；结合 24 张原始配图，整理公式、易错点和实践检查方法。
cover: /img/posts/dlcv/cover.svg
math: true
toc: true
---

## 1. CNN：从像素到空间特征

### 1.1 为什么使用卷积

把图像展平成向量，并不会在数学上删除像素信息；问题在于，普通全连接层没有直接利用图像的**局部性与空间结构**，参数也会随输入尺寸迅速增多。

卷积引入两个重要约束：一个输出只看局部区域，同一个卷积核在不同位置共享参数。边缘、纹理等结构因此可以在不同位置被检测出来。传统图像处理中，高斯、Sobel、Laplacian 等滤波器由人设计；CNN 的卷积核则通过损失函数和反向传播学习。高斯滤波中的尺度参数控制平滑程度，方向导数滤波器则强调不同方向的变化。

![卷积核通过反向传播更新的原始笔记](/img/posts/dlcv/figure-00.png)

*图 1｜卷积核也是可训练参数，更新规则与其他网络权重一致。*

严格说，常见深度学习框架实现的“卷积”通常是**互相关**：滑动核时不做数学卷积中的核翻转。对可学习的核而言，这不妨碍网络表达相应的滤波操作。[PyTorch Conv2d 文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html)

### 1.2 尺寸、参数量与感受野

设输入高度为 $H$，卷积核大小为 $K$，padding 为 $P$，stride 为 $S$，dilation 为 $D$，则输出高度为：

$$
H_{out}=\left\lfloor\frac{H+2P-D(K-1)-1}{S}\right\rfloor+1
$$

宽度同理。原笔记里的公式对应 $D=1$；向下取整不能省略。例如 $32\times32$ 的输入经过 $3\times3$ 卷积，取 $P=1,S=1$ 时，空间尺寸仍为 $32\times32$。

对普通、不分组的卷积，若输入通道为 $C_{in}$、输出通道为 $C_{out}$，且使用 bias，则参数量为：

$$
N_{param}=K_hK_wC_{in}C_{out}+C_{out}
$$

参数量不取决于输入图像的宽高，但计算量和中间激活显存会随宽高增加。分组卷积需把核参数项除以组数；没有 bias 时去掉最后一项。

![卷积输出尺寸与参数量计算截图](/img/posts/dlcv/figure-01.png)

*图 2｜原笔记中的尺寸计算。正文补上了 dilation 与向下取整。*

Padding 可以控制尺寸、缓解连续卷积造成的边界收缩，但它不会创造真实的边界信息；补零、反射填充等方式会引入不同的边界假设。

**感受野**是某个输出位置理论上能依赖的输入区域。若第 $l$ 层的有效核大小为 $K_l^{eff}=D_l(K_l-1)+1$，累计采样间隔为 $j_l$，则：

$$
j_l=j_{l-1}S_l,\qquad r_l=r_{l-1}+(K_l^{eff}-1)j_{l-1}
$$

从 $r_0=j_0=1$ 出发，在 stride 均为 1、无 dilation 时，连续三个 $3\times3$ 卷积的理论感受野为 $7\times7$。这只说明覆盖范围相同，不说明它与一个 $7\times7$ 卷积是同一个函数；实际有效感受野也不一定均匀覆盖整个理论范围。

![连续卷积层感受野公式](/img/posts/dlcv/figure-02.png)

*图 3｜原笔记的简式适用于等核大小、stride 为 1 的连续卷积。*

Pooling 用聚合与下采样换取更紧凑的表示，同时会丢失细节；它并不保证对所有平移完全不变。$1\times1$ 卷积在 stride 为 1 时保留空间尺寸，对每个位置的通道做线性组合，可以升降通道数。**非线性来自配合使用的激活函数，而不是 $1\times1$ 卷积本身。**

### 1.3 AlexNet、VGG 与 ResNet 分别解决什么

| 架构 | 学习时关注的问题 | 核心思路 |
| --- | --- | --- |
| AlexNet | 大规模图像分类如何用深度网络完成 | 多层卷积、ReLU、池化与全连接；原模型还使用局部响应归一化 |
| VGG | 怎样用规则结构增加深度 | 重复堆叠小卷积核 |
| ResNet | 更深的网络为什么反而更难优化 | 用残差分支和 shortcut 学习相对输入的变化 |

在通道数均为 $C$、忽略 bias 时，三个 $3\times3$ 卷积约有 $27C^2$ 个核参数，一个 $7\times7$ 卷积约有 $49C^2$ 个；前者还能插入更多激活层。这是 VGG 中“小核堆叠”的直观价值，但通道配置变化后需要重新计算。[VGG 原论文](https://arxiv.org/abs/1409.1556)

ResNet 关注的退化现象是：深层 plain network 的**训练误差**也可能变高，因此不能简单归因为过拟合。残差块把目标映射写成：

$$
y=x+F(x)
$$

当输入输出形状不一致时，shortcut 可以使用投影映射 $W_sx$。以恒等 shortcut、加法之后尚未施加额外激活的情况为例，局部梯度为：

$$
\frac{\partial L}{\partial x}=\frac{\partial L}{\partial y}\left(I+\frac{\partial F}{\partial x}\right)
$$

![Plain network 与残差块的手写比较](/img/posts/dlcv/figure-03.png)

*图 4｜原笔记中的残差结构。shortcut 提供直接路径，但“梯度至少为 1”的说法需要修正。*

这里的 $I$ 表示直接传播路径，**不是所有梯度分量都不小于 1 的保证**：上游梯度可能很小，残差项可能抵消，原始 post-activation 块的 ReLU 也会影响导数。残差结构改善优化，并不意味着深层网络一定优于浅层网络。[ResNet 原论文](https://arxiv.org/abs/1512.03385)

ResNet-50 及更深的经典模型使用 bottleneck：$1\times1\rightarrow3\times3\rightarrow1\times1$。前一层压缩通道，中间较昂贵的空间卷积在较窄的表示上计算，后一层再恢复通道。

## 2. 让网络稳定地训练

### 2.1 激活函数、初始化与归一化

激活函数不仅影响表达能力，也影响信号和梯度的传播。Sigmoid、tanh 在饱和区域梯度很小；ReLU 在正半轴保持线性，但负半轴梯度为零。Leaky ReLU 为负半轴保留斜率，GELU 使用平滑的门控。不存在脱离架构、任务和训练条件的唯一最佳选择。

初始化的目标，是避免信号在多层传递中迅速衰减或爆炸。Xavier 的常见方差形式兼顾 fan-in 和 fan-out：

$$
\operatorname{Var}(W)=\frac{2}{fan_{in}+fan_{out}}
$$

原笔记里的 $1/fan_{in}$ 可以看作只关注前向传播，或 fan-in 与 fan-out 相近时的简化。面对 ReLU，He 初始化的常见 fan-in 形式为：

$$
\operatorname{Var}(W)=\frac{2}{fan_{in}},\qquad \operatorname{Std}(W)=\sqrt{\frac{2}{fan_{in}}}
$$

这里要区分**方差与标准差**。ReLU 截断约一半输入的推导涉及对称分布与二阶矩的近似，不能不加条件地把所有激活函数都当成“方差减半”。Leaky ReLU 的增益还与负半轴斜率有关。[He 初始化论文](https://arxiv.org/abs/1502.01852)、[PyTorch 初始化文档](https://docs.pytorch.org/docs/stable/nn.init.html)

![小权重初始化导致信号衰减的推导](/img/posts/dlcv/figure-04.png)

*图 5｜理解初始化时，要同时观察前向激活与反向梯度的尺度。*

![Xavier 正态与均匀初始化公式](/img/posts/dlcv/figure-05.png)

*图 6｜Xavier 初始化的两种分布形式。*

归一化的区别主要在于“在哪些维度计算统计量”。对于常见的 $N\times C\times H\times W$ 图像特征：

| 方法 | 统计范围 | 需要注意 |
| --- | --- | --- |
| BatchNorm2d | 每个通道，在 batch 与空间维度上统计 | 默认推理时使用 running statistics；小 batch 时估计可能不稳定 |
| LayerNorm | 每个样本，由 normalized_shape 指定的维度 | 不能笼统理解为任何实现都对全部通道和空间统计 |
| InstanceNorm | 每个样本、每个通道的空间维度 | 与 BatchNorm 的跨样本统计不同 |
| GroupNorm | 每个样本，将通道分组后在组内与空间维度统计 | 不依赖 batch 统计；分组数需与通道数相容 |

具体维度和推理行为应以实现配置为准。[PyTorch 归一化层文档](https://docs.pytorch.org/docs/stable/nn.html#normalization-layers)

### 2.2 正则化与数据增强

Dropout 在训练时随机屏蔽激活，减弱对少量特征的依赖。为避免“丢弃概率”与“保留概率”混淆，令 $q$ 为保留概率，则 inverted dropout 写成：

$$
\widetilde h=\frac{m}{q}h,\qquad m\sim\operatorname{Bernoulli}(q)
$$

条件期望满足 $\mathbb{E}[\widetilde h\mid h]=h$，所以普通推理时可以直接关闭随机屏蔽。PyTorch 中的参数 `p` 表示丢弃概率，即 $q=1-p$。保持平均尺度不意味着保持方差；Dropout 正是通过随机扰动产生正则化效果。[Dropout 文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.Dropout.html)

数据增强应保持任务语义：水平翻转适用于许多自然图像，却可能改变文字或方向相关标签；分类中的随机裁剪可以丢掉部分目标，检测和分割则必须同步修改框与掩码。颜色扰动、Random Erasing、Mixup、CutMix 各有不同作用，不能只修改图像而忽略标签处理。

Weight decay 控制权重规模；对普通 SGD，某些形式与 L2 正则等价，但不能把这一结论直接推广到所有自适应优化器。Early stopping 需要依据验证集；模型集成和测试时增强可以改善最终预测，却不能替代对训练流程的检查。[Decoupled Weight Decay 原论文](https://arxiv.org/abs/1711.05101)

原笔记记录的 ResNet 配方可以保留作历史案例，但不是所有任务的推荐参数。原论文 ImageNet 实验使用 SGD、momentum 0.9、batch size 256、weight decay $10^{-4}$，不使用 Dropout；学习率从 0.1 起，在误差停滞后除以 10。这里将原记载的 $10^{-5}$ 更正为 $10^{-4}$。[原论文 §3.4](https://arxiv.org/html/1512.03385v1#S3.SS4)

### 2.3 一套可执行的训练排查顺序

我把调参顺序整理为下面这份检查表。数值范围只是示例，最终仍由任务、batch size 和优化器决定。

1. **检查输入与标签。** 可视化变换后的图片，确认类别映射、框坐标、mask 和归一化范围；预处理统计量只从训练集估计。
2. **检查初始损失。** 若 $C$ 类均匀预测、无特殊加权，交叉熵大约为 $\log C$；这不是所有损失函数的通用起点。
3. **尝试过拟合极小样本集。** 暂时减弱增强和正则化。如果仍不能学会，先检查梯度、参数更新、标签与损失实现，而不是急着更换大模型。
4. **寻找有效学习率。** 短时间运行，观察损失是否下降、是否出现 NaN 或振荡，再决定粗搜索范围。
5. **在对数尺度上粗搜。** 例如学习率取 $10^{-2},3\times10^{-3},10^{-3}$，每组先跑少量 epoch；记录条件，避免同时无规则地改动多项参数。
6. **细搜并延长训练。** 观察训练与验证曲线，选择验证集表现好的模型；不要用测试集反复挑超参数。
7. **检查训练和推理模式。** 验证时关闭 Dropout、按预期处理 BatchNorm，并确认是否需要冻结 running statistics。

| 曲线现象 | 优先检查 |
| --- | --- |
| 训练、验证都还在改善 | 训练时长和学习率调度是否过早结束 |
| 训练很好，验证较差 | 数据划分、过拟合、域差异与增强策略 |
| 两者都差 | 数据/标签错误、表达能力或优化不足；不能只凭差距小就断言欠拟合 |
| 损失突然发散 | 学习率、输入尺度、数值稳定性、异常样本 |

曲线的移动平均有助于观察趋势，但原始异常不能被平滑掩盖。这些是排查线索，不是仅凭曲线就能成立的诊断结论。[CS231n 训练与调参笔记](https://cs231n.github.io/neural-networks-3/)

### 2.4 微调与迁移学习

预训练 backbone 提取表示，任务 head 再将表示变成分类、框或其他输出。可以先冻结 backbone 训练新 head，再逐步解冻；也可以从一开始就联合微调，通常给 backbone 更小的学习率。样本量、任务差异和算力决定选择，而非固定步骤。

![CNN 预训练特征向不同任务迁移的课程截图](/img/posts/dlcv/figure-06.png)

*图 7｜原笔记中的迁移学习示意：特征提取器可以复用，输出头需要匹配任务。*

“冻结参数”与“进入 eval 模式”是两件事。将参数设为不求梯度，并不自动阻止 BatchNorm 更新统计量。使用预训练模型时，也要保持输入尺寸、通道顺序及归一化方式与权重要求相符。[PyTorch 迁移学习教程](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)

## 3. 检测与分割：保留位置的预测

### 3.1 先分清输出是什么

| 任务 | 输出 | 是否区分同类的不同个体 |
| --- | --- | --- |
| 图像分类 | 整张图片的类别 | 通常不定位个体 |
| 目标检测 | 类别、边界框、分数 | 是 |
| 语义分割 | 每个像素的语义类别 | 否 |
| 实例分割 | 每个实例的类别与 mask | 是 |

语义分割常用 encoder-decoder：先下采样获取语义与较大感受野，再上采样恢复空间分辨率。恢复分辨率不等于找回全部细节，skip connection 可以补充高分辨率特征。上采样既可使用插值，也可使用转置卷积；**转置卷积不是原卷积的数学逆运算**。步幅转置卷积可以用插零后的卷积来理解，但不是必须先后调用两个不同操作。[全卷积网络论文](https://arxiv.org/abs/1411.4038)

### 3.2 从 R-CNN 到 Faster R-CNN

滑动窗口需要枚举位置、尺度和长宽比，计算冗余很大。经典两阶段检测器逐渐把这份成本移到共享特征上：

| 方法 | 候选区域从哪里来 | 卷积计算如何组织 |
| --- | --- | --- |
| R-CNN | Selective Search 等外部方法 | 每个候选区域裁剪后分别通过 CNN |
| Fast R-CNN | 仍依赖外部候选区域 | 整图共享 CNN，RoI Pooling 后分别预测 |
| Faster R-CNN | RPN 学习生成 proposal | RPN 与后续检测器共享 backbone 特征 |

![Fast R-CNN 与逐区域 R-CNN 的结构对照](/img/posts/dlcv/figure-07.png)

*图 8｜关键差别在于共享整图卷积，不能把 Fast R-CNN 的候选区域误认为由 RPN 生成。*

Faster R-CNN 的经典 RPN 在特征图位置上使用不同尺度和宽高比的 anchor，输出 objectness 与框偏移。若每个位置有 $A$ 个 anchor，二分类采用两类 logits 时输出 $2A$ 个通道，框回归输出 $4A$ 个通道；采用单个 sigmoid 的实现则不需要 $2A$。RPN 判断的是“目标/背景”，具体类别由后续 head 识别。[Faster R-CNN 原论文](https://arxiv.org/abs/1506.01497)

![RPN 中的锚框、目标性与框偏移](/img/posts/dlcv/figure-08.png)

*图 9｜不同实现的 anchor 数量与特征尺度不同，图中的数字不是固定规定。*

训练和推理应分开理解：**与 Ground Truth 的 IoU 匹配和正负样本分配属于训练；推理时不需要真实框。** 推理流程可以概括为：

```text
输入图像 → Backbone → 共享特征图
                          ↓
                     RPN / Anchor
                          ↓
                 解码框偏移、筛选与 NMS
                          ↓
                      候选 RoI
                          ↓
                  RoI Pooling / Align
                          ↓
                 类别预测 + 边界框回归
```

给定 anchor 中心 $(x_a,y_a)$、宽高 $(w_a,h_a)$，一种经典的目标参数化是：

$$
t_x=\frac{x-x_a}{w_a},\quad t_y=\frac{y-y_a}{h_a},\quad t_w=\log\frac{w}{w_a},\quad t_h=\log\frac{h}{h_a}
$$

归一化平移和对数尺度使不同大小的框更容易共享回归规则。

![框偏移四个分量的说明](/img/posts/dlcv/figure-09.png)

*图 10｜模型预测的通常是相对参考框的偏移，不直接等同于绝对像素坐标。*

### 3.3 IoU、NMS、RoI Align 与检测损失

$$
\operatorname{IoU}(B_1,B_2)=\frac{|B_1\cap B_2|}{|B_1\cup B_2|}
$$

NMS 先取最高分框，再压制与它 IoU 超过阈值的框，重复直到候选处理完毕。RPN 的 proposal NMS 常不区分类别；最终检测结果常按类别处理。阈值太低可能误删相邻目标，太高则容易保留重复框。

RoI Pooling 把不同大小区域变成固定大小特征，其中坐标与分箱取整可能造成错位。RoI Align 避免相关量化，用双线性插值获取非整数采样位置，尤其有利于要求精确像素对应的 mask 预测。

Fast R-CNN 的多任务目标由分类损失和框回归损失组成：

$$
L=L_{cls}+\lambda\mathbf{1}_{u\geq1}L_{box}
$$

其中背景不计算对应的前景框回归项。原论文的 $L_{box}$ 使用 **Smooth L1**，不是原笔记中笼统记下的 L2；不同后续模型还可能使用其他回归损失。[Fast R-CNN §2.2](https://arxiv.org/html/1504.08083v2#S2.SS2)

### 3.4 单阶段不等于 anchor-free

经典 YOLO、SSD、RetinaNet 通常被归为单阶段检测器：直接由密集特征产生预测，不先经过独立的 proposal 阶段。但“单/两阶段”与“anchor-based/anchor-free”是两个不同的分类维度，YOLO 各版本的设计也有变化。

![Anchor-based 与 Anchor-free 的原笔记对照](/img/posts/dlcv/figure-10.png)

*图 11｜Anchor-free 可预测中心点、关键点或边界距离，具体机制取决于模型。*

![Anchor 设计的优点与问题](/img/posts/dlcv/figure-11.png)

*图 12｜anchor 数量、尺度与正负样本匹配会增加设计成本。Focal Loss 主要处理密集检测中的前景/背景不平衡，并非“取消 anchor”。*

[RetinaNet / Focal Loss 论文](https://arxiv.org/abs/1708.02002)与[FCOS 论文](https://arxiv.org/abs/1904.01355)分别提供了基于 anchor 和 anchor-free 的单阶段例子。

### 3.5 Mask R-CNN 如何做实例分割

Mask R-CNN 在 Faster R-CNN 的检测分支旁增加 mask 分支。对每个 RoI 预测局部掩码，而非仅给整图每个像素一个语义标签；再将掩码映射回对应区域。

经典实现对每个类别输出一个二值 mask。训练某个正样本时，只对其真实类别对应的 mask 计算逐像素二元交叉熵，像素使用 sigmoid，而非让不同类别的 mask 通道进行逐像素 softmax 竞争：

$$
L_{mask}=-\frac{1}{M^2}\sum_{i,j}\left[y_{ij}\log p_{ij}+(1-y_{ij})\log(1-p_{ij})\right]
$$

![Mask R-CNN 的逐像素二分类损失说明](/img/posts/dlcv/figure-12.png)

*图 13｜类别识别与 mask 预测分开，避免把实例分割理解成 RoI 内的多类语义分割。*

总目标为 $L_{cls}+L_{box}+L_{mask}$；RoI Align 解决的位置对齐问题对 mask 分支尤其重要。[Mask R-CNN 原论文](https://arxiv.org/abs/1703.06870)

## 4. 人脸识别：从分类边界到特征距离

### 4.1 Verification 与 Identification

Verification 是 **1:1**：两张人脸是否属于同一人？Identification 是 **1:N**：在已知身份库中寻找匹配者。后者还要区分闭集与开放集：开放集不能强迫任何输入都匹配到库中某个人，还需要拒识未知身份。

原笔记列出的 DeepFace、VGGFace、DeepID2 可以看作不同的经典路线：局部连接层、基于 VGG 的身份分类、以及分类与验证目标的联合训练。局部连接层与卷积层的重要区别是不同空间位置不共享同一组权重。

仅用 Softmax 分类可以产生有用的特征，但分类正确并不直接保证类内欧氏距离足够小。度量学习因此直接约束 embedding 的几何关系：同身份靠近，不同身份按一定规则分离。分类特征也能用于检索，不能把分类与检索描述为完全互斥的路线。

### 4.2 Contrastive、Triplet 与 Center Loss

对一对样本，令 $D=\|f(x_1)-f(x_2)\|_2$，并约定 $y=1$ 表示同类，一种常见 Contrastive Loss 写为：

$$
L_{pair}=yD^2+(1-y)\max(0,m-D)^2
$$

不同文献可能采用相反的标签约定或附加 $1/2$ 系数，读代码时需要核对。

![Contrastive Loss 的样本对与距离定义](/img/posts/dlcv/figure-13.png)

*图 14｜正样本被拉近，负样本至少保持一定间隔。*

FaceNet 使用归一化 embedding 与三元组 $(a,p,n)$：anchor 与 positive 同身份，negative 不同身份。原论文采用平方欧氏距离：

$$
L_{triplet}=\max\left(0,\|f(a)-f(p)\|_2^2-\|f(a)-f(n)\|_2^2+\alpha\right)
$$

![FaceNet 的三元组约束与损失](/img/posts/dlcv/figure-14.png)

*图 15｜Triplet Loss 约束相对距离；边距与距离是否平方必须配套。*

当特征满足 $\|f(x)\|_2=1$ 时：

$$
\|u-v\|_2^2=2-2u^Tv=2-2\cos\theta
$$

因此归一化后的平方欧氏距离与余弦相似度产生一致的排序。特征模长被固定后，比较主要反映方向差异。

按照上述平方距离定义，FaceNet 中 semi-hard negative 满足：

$$
d(a,p)<d(a,n)<d(a,p)+\alpha
$$

它比正样本远，但还没满足边距；过容易的负样本损失为零，始终选择最困难的负样本又可能使早期优化不稳定。这里的 $d$ 表示平方欧氏距离。[FaceNet 原论文](https://arxiv.org/abs/1503.03832)

Center Loss 为各类别学习中心，压缩特征与其类别中心之间的距离：

$$
L_{center}=\frac{1}{2}\sum_i\|f(x_i)-c_{y_i}\|_2^2,\qquad L=L_{CE}+\lambda L_{center}
$$

它通常与分类损失联合使用；单独压缩到中心并不提供充分的类间分离目标，甚至可能发生塌缩。[Center Loss 原论文](https://ydwen.github.io/papers/WenECCV16.pdf)

![Center Loss 与 Softmax 联合监督示意](/img/posts/dlcv/figure-15.png)

*图 16｜类内紧凑与类别可分是相关但不同的目标。*

![Center Loss 的公式与类别中心更新](/img/posts/dlcv/figure-16.png)

*图 17｜类别中心需要随训练更新，并不等同于把分类器权重直接当作样本中心。*

| 损失 | 训练单位 | 主要约束 | 关键实践问题 |
| --- | --- | --- | --- |
| Softmax CE | 单个样本 | 正确预测训练身份 | 测试未知身份时通常使用中间特征，而非原身份分类头 |
| Contrastive | 样本对 | 同类近、异类保持间隔 | 标签约定与正负对采样 |
| Triplet | 三元组 | 负样本比正样本更远 | 有效三元组挖掘与边距 |
| Center | 样本及类别中心 | 类内紧凑 | 配合分类目标、中心更新与权重平衡 |

## 5. ReID：匹配未见过的身份

### 5.1 任务设定与孪生网络

Person ReID 通常给定 query，在 gallery 中寻找同一人的不同摄像头或不同条件图像。训练身份与测试身份通常不重叠，模型需要学习可迁移的表示或匹配规则，而非只记住训练集姓名。

还需区分“测试身份未见过”与“测试域未见过”。同一数据集的标准训练/测试划分属于前者；直接跨数据集评估同时涉及摄像头、场景与数据分布变化，泛化难度更大。

![孪生网络与余弦相似度](/img/posts/dlcv/figure-17.png)

*图 18｜经典 Siamese 路线用两个分支提取表示，再学习或计算相似度；共享权重是常见设计。*

相似度 $s$ 配合正负标签 $t$ 后，损失决定不同错误受到多大惩罚。不同尺度、不同距离定义下的曲线不能直接比较；也不能仅凭某个损失“更平滑”就断言它一定更好。

![不同匹配损失随标签与相似度变化的曲线](/img/posts/dlcv/figure-18.png)

*图 19｜原课程图中的横轴是标签与相似度的组合量，需结合原公式理解。*

![Hinge、平方、指数与 Binomial Deviance 的原始说明](/img/posts/dlcv/figure-19.png)

*图 20｜原笔记记录的损失比较。Hinge 的零损失区和指数损失的快速增长是形状特征，不是通用性能排名。*

经典 ReID 工作曾用 CNN 联合学习表示与相似度，Binomial Deviance 是其中一种样本对目标。[Deep Metric Learning for Practical Person Re-Identification](https://arxiv.org/abs/1407.4979)

### 5.2 为什么联合分类与度量目标

身份分类目标让表示对训练类别有区分度，样本对或三元组目标进一步约束距离结构。两个任务可以共享特征提取器：

![单图身份分类与成对相似度学习的对照](/img/posts/dlcv/figure-20.png)

*图 21｜原笔记中的分类路线与匹配路线。*

![身份识别与验证联合网络结构](/img/posts/dlcv/figure-21.png)

*图 22｜联合目标的结构示例；不应将某一课程图当成所有 ReID 模型的固定架构。*

![身份分类和 Center Loss 联合监督的 CNN](/img/posts/dlcv/figure-22.png)

*图 23｜使用 Center Loss 强化类内紧凑性的示例。图中网络是特定历史实现。*

训练时可以组合目标，但系数尺度需要检查；测试时通常移除训练身份分类器，再比较特征。Center Loss 和 Triplet Loss 的训练样本组织也不同，不能只替换损失名称而忽略 batch 构造。

### 5.3 QAConv：在局部特征图中直接找对应

将整图压成一个向量后再比较，可能弱化局部对应信息。QAConv 将 query 特征图中的局部特征构造成在线卷积核，对 gallery 特征图做匹配，寻找局部响应较强的位置，再汇总成匹配分数。

![QAConv 的在线卷积核、响应图与聚合结构](/img/posts/dlcv/figure-23.png)

*图 24｜原笔记中的 QAConv 训练结构，含 class memory。*

“query-adaptive”意味着匹配核由当前 query 的特征构造，**不是每遇到一个 query 都重新训练整个网络**。它可以容忍一定错位、姿态与视角变化，但局部特征图匹配也有额外计算和存储成本。原论文在训练中使用 class memory 缓存近期类别特征图；这与后续 Graph Sampling 的版本需要区分。[QAConv 原论文](https://www.ecva.net/papers/eccv_2020/papers_ECCV/html/1369_ECCV_2020_paper.php)

## 6. Graph Sampling：把困难样本带进 batch

### 6.1 难样本挖掘发生在哪一步

在 batch 内挑 hardest negative，前提是有价值的负样本已经进入 batch。如果随机抽到的不同身份都很容易区分，再强的 batch 内挖掘也无法利用未抽到的困难身份。

Graph Sampling 把挖掘提前到采样阶段。原始笔记中的过程可以整理为：

1. 每个 epoch 开始时，从各身份选代表图像，以当前模型估计身份间的近邻关系。
2. 构建身份图：节点是身份，邻接关系表达外观上的接近程度，而非真实社交关系。
3. 选择一个身份及其近邻身份，组成 $P$ 个身份的集合。
4. 从每个身份抽取 $K$ 个实例，构成约 $P\times K$ 大小的 batch。
5. 在这个更有挑战性的 batch 中计算度量目标，并随训练继续更新采样关系。

当目标是 $P$ 个身份时，可以理解为一个起始身份加 $P-1$ 个近邻；具体参数与代表特征计算方式，应以论文版本和实现为准。早期表示不可靠时，近邻也可能有噪声，图更新还需要额外计算。[Graph Sampling 原论文](https://openaccess.thecvf.com/content/CVPR2022/papers/Liao_Graph_Sampling_Based_Deep_Metric_Learning_for_Generalizable_Person_Re-Identification_CVPR_2022_paper.pdf)

| 方法 | 困难样本在哪里寻找 |
| --- | --- |
| 随机 PK sampling | 随机选择身份与实例，没有显式寻找相似身份 |
| Batch-hard mining | 已经抽到的 batch 内 |
| Graph Sampling | 抽 batch 之前，先用身份近邻关系组织候选 |

作者仓库中，QAConv 2.1 对应加入 Graph Sampler、使用 triplet loss 的 CVPR 2022 版本。它不能与含 class memory 的早期 QAConv 训练图完全等同。[作者实现与版本说明](https://github.com/ShengcaiLiao/QAConv)

### 6.2 Rank-1 与 mAP 衡量什么

**Rank-1** 关注排序第一的 gallery 图像是否为正确身份；**mAP** 关注正确匹配在完整排序中的分布。多个正确样本时，只找到一个排在第一名，后续正确样本却都排得很远，Rank-1 可以很好而 mAP 仍较低。

设某个 query 有 $R_q$ 个有效正确匹配，排名 $k$ 的相关性为 $rel_q(k)$，前 $k$ 个结果的准确率为 $P_q(k)$，则常见的离散排序 AP 为：

$$
AP(q)=\frac{1}{R_q}\sum_k P_q(k)\,rel_q(k),\qquad mAP=\frac{1}{Q}\sum_{q=1}^{Q}AP(q)
$$

例如正确样本在第 1、3 名，AP 为 $(1+2/3)/2=5/6$，不是 1。跨实验比较时还必须核对同摄像头样本、junk 样本、无正确匹配 query 的处理，以及是否使用 re-ranking。**检测中的 mAP 与 ReID 中的 mAP 有不同评估协议，不能直接比较数值。**
