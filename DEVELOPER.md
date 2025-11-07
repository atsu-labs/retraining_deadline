# 開発者ガイド

このガイドでは、再講習受講期日確認くんの開発環境のセットアップ、コーディング規約、テスト方法、コントリビューション方法について説明します。

## 目次

1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [プロジェクト構造](#プロジェクト構造)
3. [コーディング規約](#コーディング規約)
4. [テスト](#テスト)
5. [デバッグ](#デバッグ)
6. [コントリビューション](#コントリビューション)
7. [リリースプロセス](#リリースプロセス)

---

## 開発環境のセットアップ

### 必要な環境

- **Node.js**: 14.x 以上（テスト実行用）
- **npm**: 6.x 以上
- **Git**: バージョン管理
- **モダンブラウザ**: Chrome, Firefox, Safari, Edge 等

### 初回セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/atsu-labs/retraining_deadline.git
cd retraining_deadline

# 依存パッケージをインストール
npm install

# テストを実行して環境を確認
npm test
```

### 推奨エディタ設定

#### Visual Studio Code

推奨拡張機能：

- **ESLint**: JavaScript/TypeScript のリンター
- **Prettier**: コードフォーマッター
- **Live Server**: ローカル開発サーバー
- **Jest**: テスト実行とデバッグ

`.vscode/settings.json`（推奨設定）：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "javascript.preferences.quoteStyle": "single",
  "files.eol": "\n",
  "[javascript]": {
    "editor.tabSize": 4
  }
}
```

---

## プロジェクト構造

```
retraining_deadline/
├── index.html              # メインHTML
├── test-wareki.html        # 和暦入力テストページ
├── package.json            # npmパッケージ設定
├── jest.config.js          # Jestテスト設定
├── README.md               # プロジェクト概要
├── AGENTS.md               # AI駆動開発ガイドライン
├── ARCHITECTURE.md         # アーキテクチャドキュメント
├── API.md                  # 関数リファレンス
├── DEVELOPER.md            # このファイル
├── kokuji.md               # 法令告示の全文
├── .gitignore              # Git無視ファイル
├── js/
│   ├── script.js           # メインロジック（ES6モジュール）
│   ├── dateUtils.js        # 日付処理ユーティリティ
│   ├── dateUtils.test.js   # dateUtilsのユニットテスト
│   └── fusoku2.test.js     # 附則2号特例のテスト
├── css/
│   ├── style.css           # メインスタイル
│   └── timeline-custom.css # タイムラインカスタムスタイル
└── coverage/               # テストカバレッジレポート（自動生成）
```

---

## コーディング規約

### JavaScript

#### 基本原則

1. **ES6+モジュールを使用**

   ```javascript
   // Good
   import { formatDate } from './dateUtils.js';
   export function myFunction() { ... }

   // Bad
   const dateUtils = require('./dateUtils.js');
   ```

2. **純粋関数を優先**

   ```javascript
   // Good: 純粋関数（副作用なし）
   export function nextApril1st(date) {
     const dt = new Date(date.getTime());
     // ...
     return dt;
   }

   // Bad: 引数を変更（副作用あり）
   export function nextApril1st(date) {
     date.setMonth(3);
     return date;
   }
   ```

3. **意味のある変数名を使用**

   ```javascript
   // Good
   const senninBefore4Years = dateAfterYear(senninDate, -4);

   // Bad
   const d = dateAfterYear(s, -4);
   ```

4. **コメントは日本語で記述**
   ```javascript
   /**
    * 指定した日付から見て次の4月1日を取得
    * @param {Date} date - 基準日
    * @returns {Date} 次の4月1日
    */
   export function nextApril1st(date) {
     // 月末の日付による誤動作を防ぐため、先に日付を1日に設定
     const dt = new Date(date.getTime());
     dt.setDate(1);
     // ...
   }
   ```

#### 命名規則

- **関数**: キャメルケース（`calculateBoukaLimit`, `getDaysRemaining`）
- **定数**: アッパースネークケース（`YEARS_FOR_LIMIT`, `COLORS`）
- **変数**: キャメルケース（`limitDate`, `isCheckBousai`）
- **プライベート関数**: 先頭にアンダースコア（使用していないが、必要なら`_helperFunction`）

#### JSDoc 形式

すべての公開関数に JSDoc コメントを付与：

```javascript
/**
 * 防火管理受講期限を計算
 * @param {Date} boukaJukouDate - 防火受講日
 * @param {Date} senninDate - 選任日
 * @param {Date|null} bousaiJukouDate - 防災受講日（附則2号判定用）
 * @returns {{limitDate: Date, message: string, isBouka5years: boolean, fusoku2Applied: boolean}}
 */
function calculateBoukaLimit(
  boukaJukouDate,
  senninDate,
  bousaiJukouDate = null
) {
  // ...
}
```

### CSS

#### 基本原則

1. **BEM 命名規則を参考にする**

   ```css
   /* Block */
   .result-container {
   }

   /* Element */
   .result-container__deadline {
   }

   /* Modifier */
   .result-container--urgent {
   }
   ```

2. **クラス名は日本語を避ける**

   ```css
   /* Good */
   .status-warning {
   }

   /* Bad */
   .警告 {
   }
   ```

3. **セレクタの詳細度を低く保つ**

   ```css
   /* Good */
   .deadline-date {
   }

   /* Bad */
   div.container .section .deadline-date {
   }
   ```

### HTML

1. **セマンティックなタグを使用**

   ```html
   <!-- Good -->
   <section class="form-section">
     <form>...</form>
   </section>

   <!-- Bad -->
   <div class="form-section">
     <div>...</div>
   </div>
   ```

2. **アクセシビリティを考慮**

   ```html
   <!-- Good -->
   <label for="senninDate">選任日</label>
   <input type="date" id="senninDate" />

   <!-- Bad -->
   <div>選任日</div>
   <input type="date" />
   ```

---

## テスト

### テストフレームワーク

**Jest**を使用しています。

### テストの実行

```bash
# すべてのテストを実行
npm test

# ウォッチモードで実行（ファイル変更を監視）
npm run test:watch

# カバレッジレポート付きで実行
npm run test:coverage
```

### カバレッジレポートの確認

```bash
# カバレッジレポートを生成
npm run test:coverage

# HTMLレポートをブラウザで開く
open coverage/lcov-report/index.html
```

### テストの書き方

#### 基本構造

```javascript
import { nextApril1st } from "./dateUtils.js";

describe("nextApril1st", () => {
  test("4月以降の日付は翌年の4月1日を返す", () => {
    const date = new Date(2023, 5, 15); // 2023年6月15日
    const result = nextApril1st(date);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(3); // 4月は3（0始まり）
    expect(result.getDate()).toBe(1);
  });

  test("1-3月の日付は同年の4月1日を返す", () => {
    const date = new Date(2023, 1, 10); // 2023年2月10日
    const result = nextApril1st(date);

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(1);
  });
});
```

#### テストのベストプラクティス

1. **1 テスト 1 アサーション原則**

   - 理想的には 1 つのテストで 1 つのことだけを検証
   - ただし、関連する複数のプロパティ検証は許容

2. **境界値のテスト**

   ```javascript
   describe("dateAfterYear", () => {
     test("うるう年の2月29日から4年後", () => {
       const date = new Date(2020, 1, 29); // 2020年2月29日
       const result = dateAfterYear(date, 4);
       // 2024年2月29日（うるう年）
       expect(result.getDate()).toBe(29);
     });

     test("うるう年の2月29日から1年後", () => {
       const date = new Date(2020, 1, 29); // 2020年2月29日
       const result = dateAfterYear(date, 1);
       // 2021年2月28日（平年）に調整される
       expect(result.getDate()).toBe(28);
     });
   });
   ```

3. **エラーケースのテスト**

   ```javascript
   describe("japaneseToDate", () => {
     test("存在しない和暦はnullを返す", () => {
       const result = japaneseToDate("令和", 100, 1, 1);
       expect(result).toBeNull();
     });

     test("存在しない日付（2月30日）はnullを返す", () => {
       const result = japaneseToDate("令和", 5, 2, 30);
       expect(result).toBeNull();
     });
   });
   ```

4. **テストデータの明確化**
   ```javascript
   describe("calculateBoukaLimit", () => {
     test("附則2号が適用されるケース", () => {
       // Arrange（準備）
       const boukaJukouDate = new Date(2020, 3, 1); // 2020年4月1日
       const bousaiJukouDate = new Date(2021, 5, 1); // 2021年6月1日
       const senninDate = new Date(2023, 0, 1); // 2023年1月1日

       // Act（実行）
       const result = calculateBoukaLimit(
         boukaJukouDate,
         senninDate,
         bousaiJukouDate
       );

       // Assert（検証）
       expect(result.fusoku2Applied).toBe(true);
       expect(result.limitDate).toEqual(new Date(2027, 2, 31));
     });
   });
   ```

### モックとスタブ

日付依存のテストでは、現在時刻をモック化：

```javascript
describe("getDaysRemaining", () => {
  test("残り30日の場合は緊急ステータス", () => {
    const limitDate = new Date(2024, 11, 31); // 2024年12月31日
    const baseDate = new Date(2024, 11, 1); // 2024年12月1日

    const result = getDaysRemaining(limitDate, baseDate);

    expect(result.daysRemaining).toBe(30);
    expect(result.statusClass).toBe("status-urgent");
  });
});
```

---

## デバッグ

### ブラウザ開発者ツール

1. **コンソールログ**

   ```javascript
   console.log("計算結果:", result);
   console.table(timelineData);
   ```

2. **ブレークポイント**

   - Chrome DevTools の Sources タブでブレークポイントを設定
   - `debugger;`文を使用して強制的に停止

3. **ネットワークタブ**
   - vis.js の CDN 読み込み確認
   - エラーがあれば Console に表示

### Visual Studio Code デバッグ

`.vscode/launch.json`（Chrome デバッグ設定）：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    }
  ]
}
```

### よくある問題と解決策

#### 問題 1: vis.js タイムラインが表示されない

**原因**: CDN からの読み込み失敗、またはネットワーク接続なし

**解決策**:

1. ブラウザのコンソールでエラーを確認
2. vis.js がロードされているか確認（`typeof vis !== 'undefined'`）
3. オフライン時は代替メッセージを表示

#### 問題 2: 和暦変換が正しく動作しない

**原因**: タイムゾーンの影響

**解決策**:

- `getJapaneseEra()`と`japaneseToDate()`は年月日のみで比較
- `new Date(year, month, day)`形式を使用（ISO 文字列は避ける）

#### 問題 3: テストが失敗する

**原因**: タイムゾーン依存のテスト

**解決策**:

```javascript
// Bad: タイムゾーンに依存
const date = new Date("2023-05-15");

// Good: タイムゾーン非依存
const date = new Date(2023, 4, 15); // 月は0始まり
```

---

## コントリビューション

### ワークフロー

1. **Issue を作成**

   - バグ報告や機能提案はまず Issue で議論

2. **フォークとブランチ作成**

   ```bash
   # リポジトリをフォーク（GitHubのUI上で）

   # ローカルにクローン
   git clone https://github.com/your-username/retraining_deadline.git
   cd retraining_deadline

   # 機能ブランチを作成
   git checkout -b feature/new-feature-name
   # または
   git checkout -b fix/bug-description
   ```

3. **変更を実装**

   - コーディング規約に従う
   - テストを追加・更新
   - コミットメッセージはコンベンショナルコミット形式

4. **テストとリント**

   ```bash
   # テストを実行
   npm test

   # カバレッジを確認
   npm run test:coverage
   ```

5. **コミット**

   ```bash
   git add .
   git commit -m "feat: 新しい機能の説明"
   # または
   git commit -m "fix: バグ修正の説明"
   ```

6. **プッシュとプルリクエスト**
   ```bash
   git push origin feature/new-feature-name
   ```
   - GitHub 上でプルリクエストを作成
   - 変更内容を日本語で説明

### コミットメッセージ規約

**コンベンショナルコミット形式**を使用：

```
<type>: <subject>

<body>

<footer>
```

**Type（必須）:**

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（フォーマット、セミコロン等）
- `refactor`: バグ修正でも機能追加でもないコード変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

**例:**

```bash
git commit -m "feat: 附則2号特例の自動判定機能を追加"

git commit -m "fix: 和暦変換でタイムゾーンの影響を受ける問題を修正"

git commit -m "docs: API.mdに使用例を追加"

git commit -m "test: nextApril1stの境界値テストを追加"
```

### プルリクエストのガイドライン

#### タイトル

- コミットメッセージと同じ形式
- 例: `feat: 複数の受講履歴管理機能を追加`

#### 説明

以下の情報を含める：

```markdown
## 変更内容

- 変更の概要を簡潔に説明

## 動機

- なぜこの変更が必要か
- 解決する問題や Issue 番号（#123）

## 変更の詳細

- 実装の詳細
- 設計上の判断

## テスト

- 追加したテスト
- テスト方法

## スクリーンショット（UI 変更の場合）

- 変更前後の画像

## チェックリスト

- [ ] テストを追加・更新した
- [ ] ドキュメントを更新した
- [ ] コーディング規約に従った
- [ ] すべてのテストがパスした
```

### コードレビューのポイント

**レビュアー向け:**

- コードの品質と可読性
- テストの網羅性
- ドキュメントの更新
- パフォーマンスへの影響

**コントリビューター向け:**

- フィードバックは建設的に受け取る
- 変更理由を明確に説明
- 必要に応じて修正コミットを追加

---

## リリースプロセス

### バージョニング

**セマンティックバージョニング**（SemVer）を採用：

- `MAJOR.MINOR.PATCH` (例: 1.2.3)
  - `MAJOR`: 互換性のない変更
  - `MINOR`: 後方互換性のある機能追加
  - `PATCH`: 後方互換性のあるバグ修正

### リリース手順

1. **バージョン更新**

   ```bash
   # package.jsonのバージョンを更新
   npm version patch  # または minor, major
   ```

2. **変更履歴の更新**

   - `CHANGELOG.md`に変更内容を記載（将来追加予定）

3. **タグ作成とプッシュ**

   ```bash
   git push origin main --tags
   ```

4. **GitHub リリースの作成**
   - GitHub 上でリリースノートを作成
   - 主な変更点を記載

---

## 参考資料

### 内部ドキュメント

- [README.md](./README.md): プロジェクト概要
- [ARCHITECTURE.md](./ARCHITECTURE.md): アーキテクチャ設計
- [API.md](./API.md): 関数リファレンス
- [AGENTS.md](./AGENTS.md): AI 駆動開発ガイドライン
- [kokuji.md](./kokuji.md): 法令告示

### 外部リソース

- [Jest 公式ドキュメント](https://jestjs.io/ja/)
- [Pure.css ドキュメント](https://purecss.io/)
- [vis.js Timeline ドキュメント](https://visjs.github.io/vis-timeline/docs/timeline/)
- [MDN Web Docs](https://developer.mozilla.org/ja/)
- [コンベンショナルコミット](https://www.conventionalcommits.org/ja/)

---

## サポート

質問や問題がある場合は、GitHub の Issue で報告してください。

---

**Happy Coding! 🚀**
