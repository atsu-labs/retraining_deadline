# API / 関数リファレンス

このドキュメントでは、`dateUtils.js`と`script.js`で提供される主要な関数の API 仕様を詳細に説明します。

---

## dateUtils.js

日付処理と和暦変換のための純粋関数ライブラリです。すべての関数は副作用がなく、引数を変更しません。

### 日付操作関数

#### `nextApril1st(date)`

指定した日付から見て次の 4 月 1 日を取得します。

**パラメータ:**

- `date` (Date): 基準となる日付

**戻り値:**

- `Date`: 次の 4 月 1 日の日付オブジェクト

**動作:**

- 基準日が 4 月 1 日～ 12 月 31 日の場合: 翌年の 4 月 1 日を返す
- 基準日が 1 月 1 日～ 3 月 31 日の場合: 同年の 4 月 1 日を返す

**例:**

```javascript
import { nextApril1st } from "./dateUtils.js";

const date1 = new Date(2023, 5, 15); // 2023年6月15日
console.log(nextApril1st(date1)); // 2024年4月1日

const date2 = new Date(2023, 1, 10); // 2023年2月10日
console.log(nextApril1st(date2)); // 2023年4月1日
```

**注意事項:**

- 月末の日付による誤動作を防ぐため、内部で先に日付を 1 日に設定してから月を変更しています

---

#### `dateAfterYear(date, year)`

指定した年数後（または前）の日付を取得します。

**パラメータ:**

- `date` (Date): 基準となる日付
- `year` (number): 加算する年数（負の数で過去）

**戻り値:**

- `Date`: 計算後の日付オブジェクト

**例:**

```javascript
import { dateAfterYear } from "./dateUtils.js";

const date = new Date(2023, 3, 1); // 2023年4月1日
console.log(dateAfterYear(date, 5)); // 2028年4月1日
console.log(dateAfterYear(date, -4)); // 2019年4月1日
```

**注意事項:**

- うるう年の 2 月 29 日に対して年を加算した場合、存在しない日付（例: 2 月 29 日 →2 月 28 日）に自動調整されます

---

#### `previousDay(date)`

指定した日付の前日を取得します。

**パラメータ:**

- `date` (Date): 基準となる日付

**戻り値:**

- `Date`: 前日の日付オブジェクト

**例:**

```javascript
import { previousDay } from "./dateUtils.js";

const date = new Date(2023, 4, 1); // 2023年5月1日
console.log(previousDay(date)); // 2023年4月30日
```

**用途:**

- 「○○ 日まで」を「○○ 日の前日まで」に変換する際に使用
- 例: 「2028 年 4 月 1 日から 5 年以内」→「2033 年 3 月 31 日まで」

---

#### `formatDate(date, format)`

日付を指定したフォーマットで文字列に変換します。

**パラメータ:**

- `date` (Date): フォーマットする日付
- `format` (string): フォーマット文字列

**フォーマット指定子:**

- `yyyy`: 4 桁の年
- `MM`: 2 桁の月（01-12）
- `dd`: 2 桁の日（01-31）
- `HH`: 2 桁の時（00-23）
- `mm`: 2 桁の分（00-59）
- `ss`: 2 桁の秒（00-59）
- `SSS`: 3 桁のミリ秒（000-999）

**戻り値:**

- `string`: フォーマットされた日付文字列

**例:**

```javascript
import { formatDate } from "./dateUtils.js";

const date = new Date(2023, 4, 15, 14, 30, 45, 123);

console.log(formatDate(date, "yyyy/MM/dd")); // "2023/05/15"
console.log(formatDate(date, "yyyy-MM-dd")); // "2023-05-15"
console.log(formatDate(date, "yyyy年MM月dd日")); // "2023年05月15日"
console.log(formatDate(date, "HH:mm:ss.SSS")); // "14:30:45.123"
```

---

#### `japaneseDate(date)`

日付を和暦フォーマットで取得します（Intl.DateTimeFormat を使用）。

**パラメータ:**

- `date` (Date): 変換する日付

**戻り値:**

- `string`: 和暦形式の日付文字列（例: "令和 5 年 5 月 15 日"）

**例:**

```javascript
import { japaneseDate } from "./dateUtils.js";

const date = new Date(2023, 4, 15); // 2023年5月15日
console.log(japaneseDate(date)); // "令和5年5月15日"
```

**注意事項:**

- ブラウザの`Intl.DateTimeFormat`に依存するため、表示形式はブラウザによって微妙に異なる可能性があります
- より細かい制御が必要な場合は`getJapaneseEra()`を使用してください

---

### 和暦処理関数

#### `getJapaneseEra(date)`

西暦の日付から元号情報を取得します。

**パラメータ:**

- `date` (Date): 西暦の日付

**戻り値:**

- `Object | null`: 和暦情報オブジェクト、または範囲外の場合は null
  - `era` (string): 元号名（"令和", "平成", "昭和", "大正", "明治"）
  - `year` (number): 和暦の年（元年は 1）
  - `month` (number): 月（1-12）
  - `day` (number): 日（1-31）

**例:**

```javascript
import { getJapaneseEra } from "./dateUtils.js";

const date1 = new Date(2023, 4, 15); // 2023年5月15日
console.log(getJapaneseEra(date1));
// { era: "令和", year: 5, month: 5, day: 15 }

const date2 = new Date(2019, 4, 1); // 2019年5月1日（令和元年）
console.log(getJapaneseEra(date2));
// { era: "令和", year: 1, month: 5, day: 1 }

const date3 = new Date(2019, 3, 30); // 2019年4月30日（平成最終日）
console.log(getJapaneseEra(date3));
// { era: "平成", year: 31, month: 4, day: 30 }
```

**対応元号:**

- 令和: 2019 年 5 月 1 日～
- 平成: 1989 年 1 月 8 日～ 2019 年 4 月 30 日
- 昭和: 1926 年 12 月 25 日～ 1989 年 1 月 7 日
- 大正: 1912 年 7 月 30 日～ 1926 年 12 月 24 日
- 明治: 1868 年 1 月 25 日～ 1912 年 7 月 29 日

**注意事項:**

- タイムゾーンの影響を受けないように、年月日のみで比較しています
- 1868 年 1 月 25 日より前の日付を渡した場合は null が返ります

---

#### `japaneseToDate(eraName, year, month, day)`

和暦から西暦の Date オブジェクトを生成します。

**パラメータ:**

- `eraName` (string): 元号名（"令和", "平成", "昭和", "大正", "明治"）
- `year` (number): 和暦の年（元年は 1）
- `month` (number): 月（1-12）
- `day` (number): 日（1-31）

**戻り値:**

- `Date | null`: 西暦の Date オブジェクト、不正な日付の場合は null

**例:**

```javascript
import { japaneseToDate } from "./dateUtils.js";

// 正常な変換
const date1 = japaneseToDate("令和", 5, 5, 15);
console.log(date1); // 2023年5月15日のDateオブジェクト

// 不正な日付（令和32年は存在しない）
const date2 = japaneseToDate("令和", 32, 1, 1);
console.log(date2); // null

// 不正な日付（存在しない日付）
const date3 = japaneseToDate("令和", 5, 2, 30);
console.log(date3); // null（2月30日は存在しない）

// 元号の範囲外（平成32年は令和2年）
const date4 = japaneseToDate("平成", 32, 1, 1);
console.log(date4); // null
```

**バリデーション:**

1. 元号の存在確認
2. 日付の妥当性チェック（2 月 30 日等の存在しない日付）
3. 元号の範囲内かチェック（開始日と終了日）

---

#### `getAvailableEras()`

利用可能な元号リストを取得します。

**パラメータ:** なし

**戻り値:**

- `Array<Object>`: 元号情報の配列
  - `name` (string): 元号名（"令和", "平成"等）
  - `nameShort` (string): 元号の略称（"R", "H"等）

**例:**

```javascript
import { getAvailableEras } from "./dateUtils.js";

const eras = getAvailableEras();
console.log(eras);
// [
//   { name: "令和", nameShort: "R" },
//   { name: "平成", nameShort: "H" },
//   { name: "昭和", nameShort: "S" },
//   { name: "大正", nameShort: "T" },
//   { name: "明治", nameShort: "M" }
// ]
```

**用途:**

- セレクトボックスの選択肢生成
- UI 上での元号表示

---

## script.js

アプリケーションのメインロジックを提供します。

### 計算関数

#### `calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate)`

防火管理講習の受講期限を計算します。附則 2 号特例の判定も行います。

**パラメータ:**

- `boukaJukouDate` (Date): 防火管理講習の受講日
- `senninDate` (Date): 防火管理者への選任日
- `bousaiJukouDate` (Date | null): 防災管理講習の受講日（附則 2 号判定用、省略可）

**戻り値:**

- `Object`: 計算結果オブジェクト
  - `limitDate` (Date): 受講期限日
  - `message` (string): 期限の説明メッセージ
  - `isBouka5years` (boolean): 5 年ルールが適用されたか
  - `fusoku2Applied` (boolean): 附則 2 号特例が適用されたか

**計算ロジック:**

1. 選任日の 4 年前を計算
2. 防火受講日と比較：
   - 選任日-4 年 < 防火受講日 → 防火受講日の次の 4/1 から 5 年以内
   - 選任日-4 年 ≥ 防火受講日 → 選任日から 1 年以内
3. 附則 2 号特例の判定（防災受講日が指定されている場合）

**例:**

```javascript
// 5年ルールのケース
const result1 = calculateBoukaLimit(
  new Date(2020, 3, 1), // 2020年4月1日受講
  new Date(2023, 0, 1) // 2023年1月1日選任
);
console.log(result1);
// {
//   limitDate: 2025年3月31日,
//   message: "防火受講日の次の４月１日から５年以内に受講が必要(2025/03/31)",
//   isBouka5years: true,
//   fusoku2Applied: false
// }

// 1年ルールのケース
const result2 = calculateBoukaLimit(
  new Date(2018, 3, 1), // 2018年4月1日受講
  new Date(2023, 0, 1) // 2023年1月1日選任
);
console.log(result2);
// {
//   limitDate: 2023年12月31日,
//   message: "選任から1年以内に受講が必要(2023/12/31)",
//   isBouka5years: false,
//   fusoku2Applied: false
// }
```

**附則 2 号特例の適用条件:**

1. 防火管理が 5 年ルールで計算されている
2. 防災受講日 > 防火受講日
3. 防火期限 < 防災期限

---

#### `calculateBousaiLimit(bousaiJukouDate, senninDate)`

防災管理講習の受講期限を計算します。

**パラメータ:**

- `bousaiJukouDate` (Date): 防災管理講習の受講日
- `senninDate` (Date): 防災管理者への選任日

**戻り値:**

- `Object`: 計算結果オブジェクト
  - `limitDate` (Date): 受講期限日
  - `message` (string): 期限の説明メッセージ

**計算ロジック:**

1. 選任日の 4 年前を計算
2. 防災受講日と比較：
   - 選任日-4 年 < 防災受講日 → 防災受講日の次の 4/1 から 5 年以内
   - 選任日-4 年 ≥ 防災受講日 → 選任日から 1 年以内

**例:**

```javascript
const result = calculateBousaiLimit(
  new Date(2021, 5, 1), // 2021年6月1日受講
  new Date(2023, 0, 1) // 2023年1月1日選任
);
console.log(result);
// {
//   limitDate: 2027年3月31日,
//   message: "防災受講日の次の４月１日から５年以内に受講が必要(2027/03/31)"
// }
```

---

#### `getDaysRemaining(limitDate, baseDate)`

期限までの残り日数を計算し、ステータスを判定します。

**パラメータ:**

- `limitDate` (Date): 期限日
- `baseDate` (Date | undefined): 基準日（省略時は今日）

**戻り値:**

- `Object`: ステータス情報
  - `daysRemaining` (number): 残り日数（負の数は超過日数）
  - `statusClass` (string): CSS クラス名
  - `statusText` (string): ステータステキスト

**ステータス分類:**

- `status-ok`: 90 日より先（正常）
- `status-warning`: 31 ～ 90 日（警告）
- `status-urgent`: 1 ～ 30 日（緊急）
- `status-expired`: 0 日以下（期限超過）

**例:**

```javascript
const limitDate = new Date(2024, 11, 31); // 2024年12月31日
const today = new Date(2024, 11, 1); // 2024年12月1日

const status = getDaysRemaining(limitDate, today);
console.log(status);
// {
//   daysRemaining: 30,
//   statusClass: "status-urgent",
//   statusText: "緊急"
// }
```

---

### 検証関数

#### `validateInputs(boukaJukouDate, senninDate, bousaiJukouDate, isCheckBousai)`

入力値の妥当性を検証します。

**パラメータ:**

- `boukaJukouDate` (Date | null): 防火受講日
- `senninDate` (Date | null): 選任日
- `bousaiJukouDate` (Date | null): 防災受講日
- `isCheckBousai` (boolean): 防災チェックが有効か

**戻り値:** なし（エラー時は Error をスロー）

**例外:**

- `Error`: 必須項目が空欄または不正な値の場合

**例:**

```javascript
try {
  validateInputs(null, new Date(), null, false);
} catch (e) {
  console.error(e.message); // "防火受講日・選任日が空欄または不正な値です"
}

try {
  validateInputs(new Date(), new Date(), null, true);
} catch (e) {
  console.error(e.message); // "防災管理講習受講日が空欄または不正な値です"
}
```

---

### UI 生成関数

#### `createResultMessage(boukaJukouDate, senninDate, limitDate, limitMessage, tokureiMsg, fusoku2Applied)`

計算結果の表示用 HTML を生成します。

**パラメータ:**

- `boukaJukouDate` (Date): 防火受講日
- `senninDate` (Date): 選任日
- `limitDate` (Date): 受講期限
- `limitMessage` (string): 期限メッセージ
- `tokureiMsg` (string): 特例メッセージ（防災管理情報）
- `fusoku2Applied` (boolean): 附則 2 号適用フラグ

**戻り値:**

- `string`: HTML 文字列

**生成される要素:**

- 受講期限の大きな表示
- 残り日数とステータスバッジ
- 附則 2 号特例の通知（適用時）
- 折りたたみ可能な計算詳細
- 防災管理の詳細情報（ある場合）

---

#### `createComparisonView(boukaLimit, bousaiLimit)`

防火と防災の期限を比較表示する HTML を生成します。

**パラメータ:**

- `boukaLimit` (Date): 防火管理期限
- `bousaiLimit` (Date): 防災管理期限

**戻り値:**

- `string`: HTML 文字列

**表示内容:**

- 両期限の並列表示
- 早い期限の強調表示
- 残り日数とステータス
- 比較結果のサマリー

---

#### `createTimelineData(boukaJukouDate, senninDate, bousaiJukouDate, limitDate, isCheckBousai)`

vis-timeline 用のデータ配列を生成します。

**パラメータ:**

- `boukaJukouDate` (Date): 防火受講日
- `senninDate` (Date): 選任日
- `bousaiJukouDate` (Date): 防災受講日
- `limitDate` (Date): 受講期限
- `isCheckBousai` (boolean): 防災チェック有無

**戻り値:**

- `Array<Object>`: vis-timeline 用のデータ項目配列

**データ項目の構造:**

```javascript
{
    id: number,           // 一意のID
    group: string,        // グループID ('date1', 'date2', 'term')
    content: string,      // 表示テキスト
    title: string,        // ツールチップ（オプション）
    start: string,        // 開始日 (YYYY-MM-DD形式)
    end: string,          // 終了日 (YYYY-MM-DD形式、範囲の場合)
    className: string,    // CSSクラス
    style: string         // インラインスタイル（色指定）
}
```

---

### 和暦入力サポート関数

#### `setupDateSync(westernId, prefix)`

和暦・西暦の双方向同期を設定します。

**パラメータ:**

- `westernId` (string): 西暦入力フィールドの ID
- `prefix` (string): 和暦入力フィールドのプレフィックス（'sennin', 'bouka', 'bousai'）

**動作:**

- 西暦入力の変更時に和暦を自動更新
- 和暦入力の変更時に西暦を自動更新
- 不正な和暦の場合はエラーメッセージを表示

**使用例:**

```javascript
// DOMContentLoaded後に呼び出し
setupDateSync("senninDate", "sennin");
setupDateSync("boukaJukouDate", "bouka");
setupDateSync("bousaiJukouDate", "bousai");
```

---

## 定数

### COLORS（script.js）

タイムライン表示用の色定義オブジェクトです。

```javascript
const COLORS = {
  BOUKA_DATE: "#FFB3BA", // 防火受講日
  BOUKA_NEXT_APRIL: "#FF8A8A", // 防火受講日の次の4/1
  BOUKA_TERM: "#FFCDD2", // 防火期間
  BOUKA_BORDER: "#E57373", // 防火ボーダー
  BOUSAI_DATE: "#B3D9FF", // 防災受講日
  BOUSAI_NEXT_APRIL: "#8AC6FF", // 防災受講日の次の4/1
  BOUSAI_TERM: "#BBDEFB", // 防災期間
  BOUSAI_BORDER: "#42A5F5", // 防災ボーダー
  SENNIN_DATE: "#C8E6C9", // 選任日
  SENNIN_TERM: "#A5D6A7", // 選任期間
  SENNIN_BORDER: "#66BB6A", // 選任ボーダー
  LIMIT_DATE: "#FF5252", // 受講期日
  LIMIT_BORDER: "#D32F2F", // 受講期日ボーダー
};
```

### ERAS（dateUtils.js）

元号の定義配列です（内部定数）。

```javascript
const ERAS = [
  { name: "令和", nameShort: "R", start: new Date(2019, 4, 1), end: null },
  {
    name: "平成",
    nameShort: "H",
    start: new Date(1989, 0, 8),
    end: new Date(2019, 3, 30),
  },
  {
    name: "昭和",
    nameShort: "S",
    start: new Date(1926, 11, 25),
    end: new Date(1989, 0, 7),
  },
  {
    name: "大正",
    nameShort: "T",
    start: new Date(1912, 6, 30),
    end: new Date(1926, 11, 24),
  },
  {
    name: "明治",
    nameShort: "M",
    start: new Date(1868, 0, 25),
    end: new Date(1912, 6, 29),
  },
];
```

---

## 使用パターン

### パターン 1: 防火管理のみの期限計算

```javascript
import { formatDate } from "./dateUtils.js";

const boukaJukouDate = new Date(2020, 3, 1); // 2020年4月1日
const senninDate = new Date(2023, 0, 1); // 2023年1月1日

const result = calculateBoukaLimit(boukaJukouDate, senninDate);
console.log(`期限: ${formatDate(result.limitDate, "yyyy/MM/dd")}`);
console.log(`メッセージ: ${result.message}`);
```

### パターン 2: 防火・防災両方の期限計算

```javascript
const boukaJukouDate = new Date(2020, 3, 1);
const bousaiJukouDate = new Date(2021, 5, 1);
const senninDate = new Date(2023, 0, 1);

const boukaResult = calculateBoukaLimit(
  boukaJukouDate,
  senninDate,
  bousaiJukouDate
);
const bousaiResult = calculateBousaiLimit(bousaiJukouDate, senninDate);

// 早い方の期限を採用
const finalLimit =
  boukaResult.limitDate < bousaiResult.limitDate
    ? boukaResult.limitDate
    : bousaiResult.limitDate;

console.log(`最終期限: ${formatDate(finalLimit, "yyyy/MM/dd")}`);

if (boukaResult.fusoku2Applied) {
  console.log("附則2号特例が適用されました");
}
```

### パターン 3: 和暦から西暦への変換

```javascript
import { japaneseToDate, formatDate } from "./dateUtils.js";

const date = japaneseToDate("令和", 5, 5, 15);
if (date) {
  console.log(formatDate(date, "yyyy/MM/dd")); // "2023/05/15"
} else {
  console.error("無効な和暦です");
}
```

### パターン 4: 西暦から和暦への変換

```javascript
import { getJapaneseEra } from "./dateUtils.js";

const date = new Date(2023, 4, 15);
const jpDate = getJapaneseEra(date);
if (jpDate) {
  console.log(`${jpDate.era}${jpDate.year}年${jpDate.month}月${jpDate.day}日`);
  // "令和5年5月15日"
}
```

---

## エラーハンドリング

### 入力検証エラー

```javascript
try {
  validateInputs(null, null, null, false);
} catch (error) {
  // ユーザーに表示するエラーメッセージ
  console.error(error.message);
}
```

### 和暦変換エラー

```javascript
const date = japaneseToDate("平成", 50, 1, 1);
if (date === null) {
  console.error("存在しない和暦です");
}
```

---

## テストのベストプラクティス

### dateUtils.js のテスト

```javascript
import { nextApril1st, japaneseToDate } from "./dateUtils.js";

describe("nextApril1st", () => {
  test("4月以降の日付は翌年の4月1日を返す", () => {
    const date = new Date(2023, 5, 15); // 2023年6月15日
    const result = nextApril1st(date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(3); // 4月は3
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

### script.js のテスト

```javascript
describe("calculateBoukaLimit", () => {
  test("5年ルールが適用されるケース", () => {
    const boukaDate = new Date(2020, 3, 1);
    const senninDate = new Date(2023, 0, 1);

    const result = calculateBoukaLimit(boukaDate, senninDate);

    expect(result.isBouka5years).toBe(true);
    expect(result.limitDate).toEqual(new Date(2025, 2, 31));
  });
});
```

---

## パフォーマンス考慮事項

- すべての日付関数は O(1) の時間複雑度
- `getJapaneseEra`は最大 5 回のループ（元号数）
- DOM 操作は最小限に抑え、innerHTML 一括更新を使用
- タイムラインデータは必要時のみ生成

---

## 今後の拡張予定

- [ ] 和暦範囲の拡張（明治以前）
- [ ] 複数の受講履歴の管理
- [ ] iCalendar 形式でのエクスポート
- [ ] 通知機能の追加

---

このリファレンスは、コードの実装と同期して更新されます。最新の情報は常にソースコード内の JSDoc コメントを参照してください。
