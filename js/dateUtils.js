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
