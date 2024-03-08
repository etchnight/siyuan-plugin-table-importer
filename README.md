# 块转换工具

[English](./README_en_US.md)

## 表格插入助手

将 html 类型的表格块转换为思源内置表格块。

### 使用方法

1. 新建 html 块，在其中粘贴表格 html 代码（必须含有`<table>`标签）
2. 点击块标 -> 插件 -> 转换为思源表格
3. 转换后的表格将插入在步骤 1 新建的 html 之后

- Q : 是否支持 Word、Excel 中的表格？
- A : 不支持，上述文件均可以另存为 html 文件

## 流程图生成器

将块引用形式的流程转换为 Mermaid 流程图。

### 使用方法

- 点击块标 -> 插件 -> 生成流程图 -> 生成的流程图插入在该块之后
- 基本语法：`[自身块别名]->(保留关键字:线上文字)其他内容`
  - `->`或`<-`:必需，识别为下一步
  - `(线上文字)`：可选，括号内文本显示在链接上
  - `[自身块别名]`:可选，节点显示自身块别名或所有块文本内容
  - `(保留关键字:线上文字)`:可选，保留关键字表示一些特殊标识
    - event:连接线会改为虚线
- 支持中文字符`【】（）`
- 支持在一个链接中创建一组节点和线，如`[A]->(线上文字1)[B]->(线上文字2)其他内容`会解析为`A-->|线上文字1|B-->|线上文字2|下一步`