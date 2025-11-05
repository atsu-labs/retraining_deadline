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
 * 元号の定義（開始日と終了日）
 */
const ERAS = [
    { name: '令和', nameShort: 'R', start: new Date(2019, 4, 1), end: null },
    { name: '平成', nameShort: 'H', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
    { name: '昭和', nameShort: 'S', start: new Date(1926, 11, 25), end: new Date(1989, 0, 7) },
    { name: '大正', nameShort: 'T', start: new Date(1912, 6, 30), end: new Date(1926, 11, 24) },
    { name: '明治', nameShort: 'M', start: new Date(1868, 0, 25), end: new Date(1912, 6, 29) }
];

/**
 * 西暦から元号を取得
 * @param {Date} date - 西暦の日付
 * @returns {{era: string, year: number, month: number, day: number} | null} 和暦情報
 */
export function getJapaneseEra(date) {
    // タイムゾーンの影響を受けないように、年月日のみで比較
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();
    
    for (const era of ERAS) {
        const startYear = era.start.getFullYear();
        const startMonth = era.start.getMonth();
        const startDay = era.start.getDate();
        
        // 開始日との比較
        const isAfterStart = 
            targetYear > startYear ||
            (targetYear === startYear && targetMonth > startMonth) ||
            (targetYear === startYear && targetMonth === startMonth && targetDay >= startDay);
        
        // 終了日との比較（終了日がnullの場合は現在の元号）
        let isBeforeEnd = true;
        if (era.end !== null) {
            const endYear = era.end.getFullYear();
            const endMonth = era.end.getMonth();
            const endDay = era.end.getDate();
            
            isBeforeEnd = 
                targetYear < endYear ||
                (targetYear === endYear && targetMonth < endMonth) ||
                (targetYear === endYear && targetMonth === endMonth && targetDay <= endDay);
        }
        
        if (isAfterStart && isBeforeEnd) {
            const year = targetYear - startYear + 1;
            return {
                era: era.name,
                year: year,
                month: targetMonth + 1,
                day: targetDay
            };
        }
    }
    return null;
}

/**
 * 和暦から西暦のDateオブジェクトを生成
 * @param {string} eraName - 元号名（令和、平成、昭和など）
 * @param {number} year - 和暦の年
 * @param {number} month - 月（1-12）
 * @param {number} day - 日（1-31）
 * @returns {Date | null} 西暦のDateオブジェクト、不正な日付の場合はnull
 */
export function japaneseToDate(eraName, year, month, day) {
    const era = ERAS.find(e => e.name === eraName);
    if (!era) {
        return null;
    }
    
    const westernYear = era.start.getFullYear() + year - 1;
    const date = new Date(westernYear, month - 1, day);
    
    // 日付の妥当性チェック
    if (date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }
    
    // 元号の範囲内かチェック
    if (date < era.start || (era.end !== null && date > era.end)) {
        return null;
    }
    
    return date;
}

/**
 * 利用可能な元号リストを取得
 * @returns {Array<{name: string, nameShort: string}>} 元号リスト
 */
export function getAvailableEras() {
    return ERAS.map(era => ({ name: era.name, nameShort: era.nameShort }));
}
