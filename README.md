# Parathem — 平行世界的他们

AI 驱动的影视剧结局改写/预测工具。输入一部剧集名称，AI 为你生成平行世界的另一种结局。

## 功能

- **搜索剧集**：输入剧名，DeepSeek AI 自动搜索并返回完整信息
- **已完结剧集**：自定义结局描述 → AI 生成写实风格画面
- **连载中剧集**：AI 分析 → Top 5 结局走向预测 → 5 张图片
- **重新生成**：同一描述生成不同画面变体
- **历史记录**：自动保存到 localStorage

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS
- DeepSeek v4-pro + GPT Image 2
- packyapi 中转站

## 本地运行

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local 填入 API Key
npm run dev
```

## 部署 Vercel

```bash
npx vercel --prod
```

在 Vercel Dashboard 设置环境变量 `DEEPSEEK_API_KEY` 和 `OPENAI_API_KEY`。
