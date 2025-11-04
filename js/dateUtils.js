/**
 * 日付ユーティリティ関数群
 * 防火・防災管理講習の再講習期限計算に使用
 */

/**
 * 指定した日付から見て次の4月1日を取得
 * @param {Date} date - 基準日
 * @returns {Date} 次の4月1日
 */
export function nextApril1st(date) {
    const dt = new Date(date.getTime());
    // 先に日付を1日に設定してから月を変更することで、月末の日付による誤動作を防ぐ
    dt.setDate(1);
    if (dt.getMonth() >= 3) {
        dt.setFullYear(dt.getFullYear() + 1);
    }
    dt.setMonth(3);
    return dt;
}

/**
 * 指定した年数後(または前)の日付を取得
 * @param {Date} date - 基準日
 * @param {number} year - 加算する年数（負の数で過去）
 * @returns {Date} 計算後の日付
 */
export function dateAfterYear(date, year) {
    const dt = new Date(date.getTime());
    dt.setFullYear(dt.getFullYear() + year);
    return dt;
}

/**
 * 指定した日付の前日を取得
 * @param {Date} date - 基準日
 * @returns {Date} 前日の日付
 */
export function previousDay(date) {
    const dt = new Date(date.getTime());
    dt.setDate(dt.getDate() - 1);
    return dt;
}

/**
 * 日付を指定したフォーマットで文字列に変換
 * @param {Date} date - フォーマットする日付
 * @param {string} format - フォーマット文字列 (yyyy, MM, dd, HH, mm, ss, SSS)
 * @returns {string} フォーマットされた日付文字列
 */
export function formatDate(date, format) {
    format = format.replace(/yyyy/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
    return format;
}

/**
 * 日付を和暦フォーマットで取得
 * @param {Date} date - 変換する日付
 * @returns {string} 和暦形式の日付文字列
 */
export function japaneseDate(date) {
    const japaneseDate = new Intl.DateTimeFormat('ja-JP-u-ca-japanese',
        { era: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    return japaneseDate;
}

/**
 * 元号の定義
 */
const ERA_RANGES = [
    { era: '令和', startDate: new Date(2019, 4, 1), offset: 2018 },
    { era: '平成', startDate: new Date(1989, 0, 8), offset: 1988 },
    { era: '昭和', startDate: new Date(1926, 11, 25), offset: 1925 },
    { era: '大正', startDate: new Date(1912, 6, 30), offset: 1911 },
    { era: '明治', startDate: new Date(1868, 0, 1), offset: 1867 }
];

/**
 * 西暦から和暦の情報を取得
 * @param {Date} date - 西暦の日付
 * @returns {{era: string, year: number, month: number, day: number}} 和暦情報
 */
export function toJapaneseCalendar(date) {
    for (const range of ERA_RANGES) {
        if (date >= range.startDate) {
            const year = date.getFullYear() - range.offset;
            return {
                era: range.era,
                year: year,
                month: date.getMonth() + 1,
                day: date.getDate()
            };
        }
    }
    // デフォルト（明治以前）
    return {
        era: '明治',
        year: date.getFullYear() - 1867,
        month: date.getMonth() + 1,
        day: date.getDate()
    };
}

/**
 * 和暦から西暦のDateオブジェクトを生成
 * @param {string} era - 元号（令和、平成、昭和、大正、明治）
 * @param {number} year - 和暦の年
 * @param {number} month - 月（1-12）
 * @param {number} day - 日
 * @returns {Date|null} 西暦のDateオブジェクト、変換失敗時はnull
 */
export function fromJapaneseCalendar(era, year, month, day) {
    const range = ERA_RANGES.find(r => r.era === era);
    if (!range) {
        return null;
    }
    
    const westernYear = year + range.offset;
    const date = new Date(westernYear, month - 1, day);
    
    // 日付の妥当性チェック
    if (date.getFullYear() !== westernYear || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
        return null;
    }
    
    // 元号の開始日以降かチェック
    if (date < range.startDate) {
        return null;
    }
    
    return date;
}

/**
 * 利用可能な元号のリストを取得
 * @returns {string[]} 元号の配列
 */
export function getAvailableEras() {
    return ERA_RANGES.map(r => r.era);
}
