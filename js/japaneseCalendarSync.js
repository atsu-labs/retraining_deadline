/**
 * 和暦と西暦の入力フォームを同期するモジュール
 */

import { toJapaneseCalendar, fromJapaneseCalendar, getAvailableEras, formatDate } from './dateUtils.js';

/**
 * 元号のセレクトボックスを初期化
 * @param {string} selectId - セレクト要素のID
 */
function initializeEraSelect(selectId) {
    const select = document.getElementById(selectId);
    const eras = getAvailableEras();
    
    eras.forEach(era => {
        const option = document.createElement('option');
        option.value = era;
        option.textContent = era;
        select.appendChild(option);
    });
}

/**
 * 西暦入力から和暦入力を更新
 * @param {string} dateInputId - 西暦日付入力のID
 * @param {string} eraId - 元号セレクトのID
 * @param {string} yearId - 和暦年入力のID
 * @param {string} monthId - 月入力のID
 * @param {string} dayId - 日入力のID
 */
function syncWesternToJapanese(dateInputId, eraId, yearId, monthId, dayId) {
    const dateInput = document.getElementById(dateInputId);
    const date = dateInput.valueAsDate;
    
    if (date) {
        const japanese = toJapaneseCalendar(date);
        document.getElementById(eraId).value = japanese.era;
        document.getElementById(yearId).value = japanese.year;
        document.getElementById(monthId).value = japanese.month;
        document.getElementById(dayId).value = japanese.day;
    } else {
        // クリア
        document.getElementById(eraId).selectedIndex = 0;
        document.getElementById(yearId).value = '';
        document.getElementById(monthId).value = '';
        document.getElementById(dayId).value = '';
    }
}

/**
 * 和暦入力から西暦入力を更新
 * @param {string} dateInputId - 西暦日付入力のID
 * @param {string} eraId - 元号セレクトのID
 * @param {string} yearId - 和暦年入力のID
 * @param {string} monthId - 月入力のID
 * @param {string} dayId - 日入力のID
 */
function syncJapaneseToWestern(dateInputId, eraId, yearId, monthId, dayId) {
    const era = document.getElementById(eraId).value;
    const year = parseInt(document.getElementById(yearId).value);
    const month = parseInt(document.getElementById(monthId).value);
    const day = parseInt(document.getElementById(dayId).value);
    
    if (era && year && month && day) {
        const date = fromJapaneseCalendar(era, year, month, day);
        if (date) {
            document.getElementById(dateInputId).value = formatDate(date, 'yyyy-MM-dd');
        }
    }
}

/**
 * 和暦・西暦フォームの同期を初期化
 */
export function initializeJapaneseCalendarSync() {
    // 元号セレクトボックスの初期化
    initializeEraSelect('senninEra');
    initializeEraSelect('boukaEra');
    initializeEraSelect('bousaiEra');
    
    // 選任日の同期
    document.getElementById('senninDate').addEventListener('change', () => {
        syncWesternToJapanese('senninDate', 'senninEra', 'senninYear', 'senninMonth', 'senninDay');
    });
    
    ['senninEra', 'senninYear', 'senninMonth', 'senninDay'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            syncJapaneseToWestern('senninDate', 'senninEra', 'senninYear', 'senninMonth', 'senninDay');
        });
    });
    
    // 防火受講日の同期
    document.getElementById('boukaJukouDate').addEventListener('change', () => {
        syncWesternToJapanese('boukaJukouDate', 'boukaEra', 'boukaYear', 'boukaMonth', 'boukaDay');
    });
    
    ['boukaEra', 'boukaYear', 'boukaMonth', 'boukaDay'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            syncJapaneseToWestern('boukaJukouDate', 'boukaEra', 'boukaYear', 'boukaMonth', 'boukaDay');
        });
    });
    
    // 防災受講日の同期
    document.getElementById('bousaiJukouDate').addEventListener('change', () => {
        syncWesternToJapanese('bousaiJukouDate', 'bousaiEra', 'bousaiYear', 'bousaiMonth', 'bousaiDay');
    });
    
    ['bousaiEra', 'bousaiYear', 'bousaiMonth', 'bousaiDay'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            syncJapaneseToWestern('bousaiJukouDate', 'bousaiEra', 'bousaiYear', 'bousaiMonth', 'bousaiDay');
        });
    });
}
