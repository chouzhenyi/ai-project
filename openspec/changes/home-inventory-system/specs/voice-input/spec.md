## ADDED Requirements

### Requirement: 语音输入去向

系统 SHALL 支持用户在出库时通过语音输入去向。

#### Scenario: 语音输入
- **WHEN** 用户在出库页面点击语音输入按钮
- **THEN** 系统调用 Web Speech API 开始录音识别
- **WHEN** 用户停止说话
- **THEN** 系统将识别结果填入去向文本框

#### Scenario: 语音输入降级
- **WHEN** 浏览器不支持 Web Speech API（如 Safari）
- **THEN** 系统隐藏语音按钮，仅显示文本输入框

### Requirement: 语音输入备注

系统 SHALL 支持用户在入库/出库时通过语音输入备注。

#### Scenario: 备注语音输入
- **WHEN** 用户点击备注旁的语音输入按钮
- **THEN** 系统调用语音识别并填入备注文本框
