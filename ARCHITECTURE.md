# アーキテクチャドキュメント

## 概要

このアプリケーションは、防火・防災管理講習の再講習期限を計算するためのシングルページアプリケーション（SPA）です。バニラ JavaScript（ES6+モジュール）で実装されており、外部フレームワークへの依存を最小限に抑えています。

## システムアーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────┐
│      プレゼンテーション層            │
│  (index.html / CSS / DOM操作)       │
└───────────┬─────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│        アプリケーション層            │
│      (script.js - ビジネスロジック)  │
└───────────┬─────────────────────────┘
            │
┌───────────▼─────────────────────────┐
│        ユーティリティ層              │
│    (dateUtils.js - 日付処理)        │
└─────────────────────────────────────┘
```

## モジュール構成

### 1. dateUtils.js - 日付処理ユーティリティ

日付計算と和暦変換に関する純粋な関数群を提供します。

#### 主要関数

**基本的な日付操作:**

- `nextApril1st(date)`: 指定日以降の次の 4 月 1 日を取得
- `dateAfterYear(date, year)`: 指定年数後（または前）の日付を取得
- `previousDay(date)`: 前日の日付を取得
- `formatDate(date, format)`: 日付を指定フォーマットで文字列化
- `japaneseDate(date)`: 日付を和暦フォーマットで取得

**和暦処理:**

- `getJapaneseEra(date)`: 西暦から元号情報を取得
- `japaneseToDate(eraName, year, month, day)`: 和暦から西暦の Date オブジェクトを生成
- `getAvailableEras()`: 利用可能な元号リストを取得

#### 設計原則

- **純粋関数**: すべての関数は副作用なし、同じ入力には常に同じ出力
- **イミュータブル**: 引数の Date オブジェクトは変更せず、新しい Date オブジェクトを返す
- **テスタビリティ**: 単体テストが容易な構造

### 2. script.js - メインアプリケーションロジック

ユーザーインタラクション、計算ロジック、UI 更新を統合管理します。

#### 主要機能モジュール

##### 2.1 計算エンジン

**`calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate)`**

- 防火管理講習の受講期限を計算
- 附則 2 号特例の自動判定と適用
- 戻り値: `{limitDate, message, isBouka5years, fusoku2Applied}`

**`calculateBousaiLimit(bousaiJukouDate, senninDate)`**

- 防災管理講習の受講期限を計算
- 4 月 1 日起算の 5 年ルールを適用
- 戻り値: `{limitDate, message}`

**`getDaysRemaining(limitDate, baseDate)`**

- 期限までの残り日数を計算
- ステータス分類（正常/警告/緊急/超過）
- 戻り値: `{daysRemaining, statusClass, statusText}`

##### 2.2 検証機能

**`validateInputs(boukaJukouDate, senninDate, bousaiJukouDate, isCheckBousai)`**

- 入力値の必須チェック
- 不正な値の検出
- エラーメッセージの生成

##### 2.3 UI 生成機能

**`createResultMessage(boukaJukouDate, senninDate, limitDate, limitMessage, tokureiMsg, fusoku2Applied)`**

- 計算結果の表示 HTML 生成
- 残り日数と緊急度の表示
- 計算詳細の折りたたみ表示

**`createComparisonView(boukaLimit, bousaiLimit)`**

- 防火・防災期限の比較表示
- 早い期限の強調表示
- 両期限が同日の場合の特別表示

**`createTimelineData(boukaJukouDate, senninDate, bousaiJukouDate, limitDate, isCheckBousai)`**

- vis-timeline 用のデータ生成
- 重要な日付と期間のマッピング
- 色分けとスタイリング

##### 2.4 和暦入力サポート

**`initializeDateSelects()`**

- 月・日のセレクトボックスを動的生成

**`initializeEraSelects()`**

- 元号セレクトボックスを動的生成

**`updateJapaneseFromWestern(westernId, prefix)`**

- 西暦入力から和暦を自動更新

**`updateWesternFromJapanese(westernId, prefix)`**

- 和暦入力から西暦を自動更新
- 不正な日付の検出とエラー表示

**`setupDateSync(westernId, prefix)`**

- 和暦・西暦の双方向同期設定

## 計算ロジックの詳細

### 防火管理講習期限の計算フロー

```
入力: 防火受講日、選任日
      ↓
選任日の4年前を計算
      ↓
    ┌─┴─┐
    │比較│ 防火受講日 vs 選任日-4年
    └─┬─┘
      │
  ┌───┴───┐
  │       │
後の場合  前の場合
  │       │
  ▼       ▼
4/1起算  選任日起算
5年以内  1年以内
  │       │
  └───┬───┘
      ▼
  附則2号判定
  (防災管理との関係)
      ▼
   最終期限
```

### 附則 2 号特例の判定フロー

```
条件1: 防火管理が5年ルールで計算されているか？
       ↓ YES
条件2: 防災受講日 > 防火受講日？
       ↓ YES
条件3: 防火期限 < 防災期限？
       ↓ YES
特例適用: 防火期限を防災受講日の次の4/1から5年に延長
       ↓ NO (いずれかの条件)
特例適用なし: 通常の防火期限を使用
```

### 防災管理講習期限の計算フロー

```
入力: 防災受講日、選任日
      ↓
選任日の4年前を計算
      ↓
    ┌─┴─┐
    │比較│ 防災受講日 vs 選任日-4年
    └─┬─┘
      │
  ┌───┴───┐
  │       │
後の場合  前の場合
  │       │
  ▼       ▼
4/1起算  選任日起算
5年以内  1年以内
  │       │
  └───┬───┘
      ▼
   最終期限
```

## データフロー

### ユーザー入力から結果表示までの流れ

```
1. ユーザー入力
   ├─ 西暦入力 → 和暦自動更新
   └─ 和暦入力 → 西暦自動更新
         ↓
2. 「確認」ボタンクリック
         ↓
3. validateInputs() - 入力検証
         ↓
4. 並行処理:
   ├─ calculateBoukaLimit() - 防火期限計算（附則2号判定含む）
   └─ calculateBousaiLimit() - 防災期限計算（防災チェックONの場合）
         ↓
5. 期限の比較と最終判定
         ↓
6. UI生成:
   ├─ createResultMessage() - 結果メッセージ
   ├─ createComparisonView() - 比較表示（防災有の場合）
   └─ createTimelineData() + renderTimeline() - タイムライン
         ↓
7. DOM更新 - 結果表示
```

## 状態管理

このアプリケーションは**ステートレス**設計を採用しています：

- グローバル変数は定数定義（COLORS 等）のみ
- 各計算は独立した純粋関数
- DOM はイベントドリブンで更新
- ローカルストレージ等の永続化なし

### メリット

- テストが容易
- デバッグしやすい
- 予期しない副作用がない
- 並行処理の問題がない

## エラーハンドリング

### エラー検出ポイント

1. **入力検証段階** (`validateInputs`)

   - 必須項目の欠如
   - 不正な日付値

2. **和暦変換段階** (`japaneseToDate`)

   - 存在しない日付（例: 平成 32 年）
   - 元号の範囲外の日付

3. **タイムライン描画段階** (`renderTimeline`)
   - vis.js ライブラリの読み込み失敗（CDN 接続エラー）

### エラー処理戦略

- **ユーザーフレンドリーなメッセージ**: 技術的詳細ではなく、対処方法を示す
- **非破壊的なフォールバック**: 一部機能が失敗しても他は動作継続
- **視覚的フィードバック**: エラーは赤色テキストで明示

## パフォーマンス最適化

### 現在の最適化

1. **遅延読み込み**

   - vis.js は CDN から必要時のみ読み込み
   - タイムラインデータは計算完了後に生成

2. **効率的な DOM 操作**

   - innerHTML 一括更新（複数の appendChild ではなく）
   - イベントリスナーの適切な委譲

3. **軽量な依存関係**
   - Pure.css: 3.8KB (gzip)
   - vis.js: CDN 経由での遅延読み込み

### 今後の改善可能性

- タイムライン表示のオプション化（重い環境では非表示）
- Service Worker によるオフライン対応
- Web Workers での計算の非同期化（ただし現状では過剰）

## セキュリティ考慮事項

### 現在の対策

1. **XSS 対策**

   - ユーザー入力は日付型のみ（type="date"）
   - 和暦入力もセレクトボックスと数値のみ
   - innerHTML 使用箇所は計算結果のみ（外部入力なし）

2. **依存関係の安全性**
   - CDN リソースに SRI（Subresource Integrity）は未使用
   - 定期的な npm audit の実行推奨

### 今後の改善

- CDN リソースへの SRI 追加
- Content Security Policy (CSP)の設定

## テスト戦略

### テストカバレッジ

- **dateUtils.js**: 100%カバレッジ目標

  - 境界値テスト（月末、年末等）
  - 元号の境界（令和元年、平成 31 年等）
  - タイムゾーン非依存性の確認

- **script.js**: 主要なビジネスロジック
  - 計算関数のユニットテスト
  - 附則 2 号特例の各種パターン
  - エラーケースの網羅

### テストファイル構成

```
js/
├── dateUtils.test.js    # 日付ユーティリティのテスト
└── fusoku2.test.js      # 附則2号特例のテスト
```

## 拡張性

### 追加機能の実装指針

1. **新しい計算ルールの追加**

   - `calculateBoukaLimit`または`calculateBousaiLimit`を拡張
   - 新しいテストケースを追加

2. **新しい元号の追加**

   - `dateUtils.js`の`ERAS`配列に追加
   - テストケースを追加

3. **UI の改善**

   - CSS ファイルの修正（style.css, timeline-custom.css）
   - script.js の UI 生成関数を拡張

4. **多言語対応**
   - i18n ライブラリの導入
   - メッセージのキー化

## ブラウザ互換性

### 対応ブラウザ

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### 使用している主要 API

- ES6 Modules (`import/export`)
- `Intl.DateTimeFormat`（和暦フォーマット）
- `HTMLInputElement.valueAsDate`（日付入力）
- Template literals
- Arrow functions
- Destructuring assignment

### ポリフィル不要な設計

モダンブラウザのみをターゲットとし、レガシーブラウザのサポートは行わない方針です。

## 設計判断の記録

### なぜバニラ JavaScript か？

- **軽量性**: フレームワークのオーバーヘッドなし
- **学習コスト**: JavaScript 標準 API のみ
- **依存関係**: セキュリティリスクの最小化
- **永続性**: フレームワークのライフサイクルに依存しない

### なぜ SPA か？

- **ユーザー体験**: ページ遷移なしの即座な結果表示
- **シンプルさ**: サーバーサイド不要
- **デプロイ**: 静的ファイルのみでホスティング可能

### なぜ vis.js か？

- **視覚的**: タイムライン表示に特化
- **軽量**: 特定用途に最適化
- **CDN**: ローカルバンドル不要

## 今後の課題

### 短期的な改善

1. ✅ ドキュメントの整備（このドキュメント）
2. テストカバレッジの向上（現状 70%程度）
3. アクセシビリティの改善（ARIA 属性の追加）

### 長期的な改善

1. PWA 化（オフライン対応、インストール可能）
2. 履歴機能（過去の計算結果を保存）
3. PDF 出力機能（計算結果の印刷）
4. 多言語対応（英語版の提供）

## 参考資料

- [消防法施行規則](https://elaws.e-gov.go.jp/)
- [甲種防火管理再講習について定める件](./kokuji.md)
- [vis.js Timeline Documentation](https://visjs.github.io/vis-timeline/docs/timeline/)
- [Pure.css Documentation](https://purecss.io/)
