import { formatDate, japaneseDate, nextApril1st, dateAfterYear, previousDay, getJapaneseEra, japaneseToDate, getAvailableEras } from './dateUtils.js';

// 定数定義
const YEARS_BEFORE_SENNIN = -4;
const YEARS_FOR_LIMIT = 5;
const ONE_YEAR = 1;

// タイムライン色定義
const COLORS = {
    BOUKA_DATE: '#FFB3BA',        // 防火受講日 - ライトレッド
    BOUKA_NEXT_APRIL: '#FF8A8A',  // 防火受講日の次の4/1 - ミディアムレッド
    BOUKA_TERM: '#FFCDD2',        // 防火期間 - 淡いレッド
    BOUKA_BORDER: '#E57373',      // 防火ボーダー
    BOUSAI_DATE: '#B3D9FF',       // 防災受講日 - ライトブルー
    BOUSAI_NEXT_APRIL: '#8AC6FF', // 防災受講日の次の4/1 - ミディアムブルー
    BOUSAI_TERM: '#BBDEFB',       // 防災期間 - 淡いブルー
    BOUSAI_BORDER: '#42A5F5',     // 防災ボーダー
    SENNIN_DATE: '#C8E6C9',       // 選任日 - ライトグリーン
    SENNIN_TERM: '#A5D6A7',       // 選任期間 - ミディアムグリーン
    SENNIN_BORDER: '#66BB6A',     // 選任ボーダー
    LIMIT_DATE: '#FF5252',        // 受講期日 - ダークレッド（警告色）
    LIMIT_BORDER: '#D32F2F'       // 受講期日ボーダー
};

/**
 * 入力値を検証
 * @param {Date|null} boukaJukouDate - 防火受講日
 * @param {Date|null} senninDate - 選任日
 * @param {Date|null} bousaiJukouDate - 防災受講日
 * @param {boolean} isCheckBousai - 防災チェック有無
 * @throws {Error} 必須項目が空欄の場合
 */
function validateInputs(boukaJukouDate, senninDate, bousaiJukouDate, isCheckBousai) {
    if (boukaJukouDate === null || senninDate === null) {
        throw new Error('防火受講日・選任日が空欄または不正な値です');
    }
    if (isCheckBousai && bousaiJukouDate === null) {
        throw new Error('防災管理講習受講日が空欄または不正な値です');
    }
}

/**
 * 防火管理受講期限を計算
 * @param {Date} boukaJukouDate - 防火受講日
 * @param {Date} senninDate - 選任日
 * @param {Date|null} bousaiJukouDate - 防災受講日（附則2号判定用）
 * @returns {{limitDate: Date, message: string, isBouka5years: boolean, fusoku2Applied: boolean}}
 */
function calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate = null) {
    const senninBefore4y = dateAfterYear(senninDate, YEARS_BEFORE_SENNIN);
    
    let limitDate;
    let message;
    let isBouka5years;
    let fusoku2Applied = false;
    
    if (senninBefore4y > boukaJukouDate) {
        // 選任日から過去4年以内に防火受講がない場合
        limitDate = previousDay(dateAfterYear(senninDate, ONE_YEAR));
        message = `選任から1年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`;
        isBouka5years = false;
    } else {
        // 選任日から過去4年以内に防火受講がある場合
        limitDate = previousDay(dateAfterYear(nextApril1st(boukaJukouDate), YEARS_FOR_LIMIT));
        message = `防火受講日の次の４月１日から５年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`;
        isBouka5years = true;
    }
    
    // 附則2号の特例判定
    if (bousaiJukouDate !== null && bousaiJukouDate > boukaJukouDate) {
        // 防災管理講習期限を計算
        const senninBefore4yForBousai = dateAfterYear(senninDate, YEARS_BEFORE_SENNIN);
        let bousaiLimit;
        
        if (senninBefore4yForBousai > bousaiJukouDate) {
            // 防災：選任日から1年以内
            bousaiLimit = previousDay(dateAfterYear(senninDate, ONE_YEAR));
        } else {
            // 防災：講習日から5年以内（4月1日起算なし）
            bousaiLimit = previousDay(dateAfterYear(bousaiJukouDate, YEARS_FOR_LIMIT));
        }
        
        // 附則2号適用条件：防火期限が防災期限より早い場合
        if (limitDate < bousaiLimit) {
            // 附則2号：防災管理新規講習の次の4月1日から5年
            const bousaiNextApril = nextApril1st(bousaiJukouDate);
            const fusoku2Limit = previousDay(dateAfterYear(bousaiNextApril, YEARS_FOR_LIMIT));
            
            // 特例期限が基本期限より後の場合のみ適用
            if (fusoku2Limit > limitDate) {
                limitDate = fusoku2Limit;
                message = `防災管理新規講習（${formatDate(bousaiJukouDate, 'yyyy/MM/dd')}）の次の４月１日から５年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`;
                fusoku2Applied = true;
            }
        }
    }
    
    return {
        limitDate,
        message,
        isBouka5years,
        fusoku2Applied
    };
}

/**
 * 防災管理受講期限を計算
 * @param {Date} bousaiJukouDate - 防災受講日
 * @param {Date} senninDate - 選任日
 * @returns {{limitDate: Date, message: string}}
 */
function calculateBousaiLimit(bousaiJukouDate, senninDate) {
    const senninBefore4y = dateAfterYear(senninDate, YEARS_BEFORE_SENNIN);
    
    let limitDate;
    let message;
    
    if (senninBefore4y > bousaiJukouDate) {
        // 選任日から過去4年以内に防災受講がない場合
        limitDate = previousDay(dateAfterYear(senninDate, ONE_YEAR));
        message = `選任から1年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`;
    } else {
        // 選任日から過去4年以内に防災受講がある場合
        // 防災は講習日から直接5年（4月1日起算なし）
        limitDate = previousDay(dateAfterYear(bousaiJukouDate, YEARS_FOR_LIMIT));
        message = `防災受講日から５年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`;
    }
    
    return {
        limitDate,
        message
    };
}

/**
 * タイムライン用のデータ項目を生成
 * @param {Date} boukaJukouDate - 防火受講日
 * @param {Date} senninDate - 選任日
 * @param {Date} bousaiJukouDate - 防災受講日（オプション）
 * @param {Date} limitDate - 受講期限
 * @param {boolean} isCheckBousai - 防災チェック有無
 * @returns {Array} タイムライン項目配列
 */
function createTimelineData(boukaJukouDate, senninDate, bousaiJukouDate, limitDate, isCheckBousai) {
    const senninBefore4y = dateAfterYear(senninDate, YEARS_BEFORE_SENNIN);
    const boukaNextApril = nextApril1st(boukaJukouDate);
    const boukaLimit = previousDay(dateAfterYear(boukaNextApril, YEARS_FOR_LIMIT));
    const senninLimit = previousDay(dateAfterYear(senninDate, ONE_YEAR));
    
    const data = [
        {
            id: 1,
            group: 'date1',
            content: '防火受講日',
            title: formatDate(boukaJukouDate, 'yyyy-MM-dd'),
            start: formatDate(boukaJukouDate, 'yyyy-MM-dd'),
            className: 'bouka-point',
            style: `background-color:${COLORS.BOUKA_DATE}; border-color:${COLORS.BOUKA_BORDER};`
        },
        {
            id: 2,
            group: 'date1',
            content: '選任日',
            title: formatDate(senninDate, 'yyyy-MM-dd'),
            start: formatDate(senninDate, 'yyyy-MM-dd'),
            className: 'sennin-point',
            style: `background-color:${COLORS.SENNIN_DATE}; border-color:${COLORS.SENNIN_BORDER};`
        },
        {
            id: 3,
            group: 'date2',
            content: '防火受講日の次の4/1',
            start: formatDate(boukaNextApril, 'yyyy-MM-dd'),
            className: 'bouka-point',
            style: `background-color:${COLORS.BOUKA_NEXT_APRIL}; border-color:${COLORS.BOUKA_BORDER};`
        },
        {
            id: 4,
            group: 'term',
            content: '選任日から過去４年間',
            start: formatDate(senninBefore4y, 'yyyy/MM/dd'),
            end: formatDate(senninDate, 'yyyy-MM-dd'),
            className: 'sennin-range',
            style: `background-color:${COLORS.SENNIN_TERM}; border-color:${COLORS.SENNIN_BORDER};`
        },
        {
            id: 5,
            group: 'term',
            content: '防火受講日の次の4/1から5年間',
            start: formatDate(boukaNextApril, 'yyyy-MM-dd'),
            end: formatDate(boukaLimit, 'yyyy/MM/dd'),
            className: 'bouka-range',
            style: `background-color:${COLORS.BOUKA_TERM}; border-color:${COLORS.BOUKA_BORDER};`
        },
        {
            id: 6,
            group: 'term',
            content: '選任日から1年間',
            start: formatDate(senninDate, 'yyyy-MM-dd'),
            end: formatDate(senninLimit, 'yyyy-MM-dd'),
            className: 'sennin-range',
            style: `background-color:${COLORS.SENNIN_TERM}; border-color:${COLORS.SENNIN_BORDER};`
        }
    ];
    
    if (isCheckBousai) {
        const bousaiNextApril = nextApril1st(bousaiJukouDate);
        const bousaiLimit = previousDay(dateAfterYear(bousaiNextApril, YEARS_FOR_LIMIT));
        
        data.push(
            {
                id: 7,
                group: 'date1',
                content: '防災受講日',
                title: formatDate(bousaiJukouDate, 'yyyy-MM-dd'),
                start: formatDate(bousaiJukouDate, 'yyyy-MM-dd'),
                className: 'bousai-point',
                style: `background-color:${COLORS.BOUSAI_DATE}; border-color:${COLORS.BOUSAI_BORDER};`
            },
            {
                id: 8,
                group: 'date2',
                content: '防災受講日の次の4/1',
                start: formatDate(bousaiNextApril, 'yyyy-MM-dd'),
                className: 'bousai-point',
                style: `background-color:${COLORS.BOUSAI_NEXT_APRIL}; border-color:${COLORS.BOUSAI_BORDER};`
            },
            {
                id: 9,
                group: 'term',
                content: '防災受講日の次の4/1から5年間',
                start: formatDate(bousaiNextApril, 'yyyy-MM-dd'),
                end: formatDate(bousaiLimit, 'yyyy/MM/dd'),
                className: 'bousai-range',
                style: `background-color:${COLORS.BOUSAI_TERM}; border-color:${COLORS.BOUSAI_BORDER};`
            }
        );
    }
    
    data.push({
        id: 99,
        group: 'date1',
        content: '受講期日',
        title: formatDate(limitDate, 'yyyy-MM-dd'),
        start: formatDate(limitDate, 'yyyy-MM-dd'),
        className: 'limit-point',
        style: `background-color:${COLORS.LIMIT_DATE}; border-color:${COLORS.LIMIT_BORDER};`
    });
    
    return data;
}

/**
 * 結果メッセージHTMLを生成
 * @param {Date} boukaJukouDate - 防火受講日
 * @param {Date} senninDate - 選任日
 * @param {Date} limitDate - 受講期限
 * @param {string} limitMessage - 期限メッセージ
 * @param {string} tokureiMsg - 特例メッセージ
 * @returns {string} HTML文字列
 */
function createResultMessage(boukaJukouDate, senninDate, limitDate, limitMessage, tokureiMsg) {
    const senninBefore4y = dateAfterYear(senninDate, YEARS_BEFORE_SENNIN);
    
    return `
        <span class="inline">選任日：</span>
        <span class="inline">${formatDate(senninDate, 'yyyy/MM/dd')}</span><br/>
        <span class="inline">選任日の４年前：</span>
        <span class="inline">${formatDate(senninBefore4y, 'yyyy/MM/dd')}</span><br/>
        <span class="inline">防火受講日：</span>
        <span class="inline">${formatDate(boukaJukouDate, 'yyyy/MM/dd')}</span><br/>
        <span class="inline">防火受講日の次の4/1：</span>
        <span class="inline">${formatDate(nextApril1st(boukaJukouDate), 'yyyy/MM/dd')}</span><br/>
        ${limitMessage}<br/>
        <br/>
        <p>${tokureiMsg}</p>
        <b>期限は${formatDate(limitDate, 'yyyy/MM/dd')}【${japaneseDate(limitDate)}】</b>`;
}

/**
 * タイムラインを描画
 * @param {Array} data - タイムラインデータ
 */
function renderTimeline(data) {
    const container = document.getElementById('visualization');
    const groups = [
        { id: 'date1', content: '日付' },
        { id: 'date2', content: '日付' },
        { id: 'term', content: '期間' }
    ];
    
    const items = new vis.DataSet(data);
    const options = { showCurrentTime: false };
    new vis.Timeline(container, items, groups, options);
}

/**
 * メインの処理関数
 */
function buttonClick() {
    document.getElementById('visualization').innerHTML = '';

    const boukaJukouDate = document.getElementById('boukaJukouDate').valueAsDate;
    const senninDate = document.getElementById('senninDate').valueAsDate;
    const bousaiJukouDate = document.getElementById('bousaiJukouDate').valueAsDate;
    const isCheckBousai = document.getElementById('isCheckBousai').checked;

    try {
        // 入力検証
        validateInputs(boukaJukouDate, senninDate, bousaiJukouDate, isCheckBousai);

        // 防火管理期限計算（附則2号考慮）
        const boukaResult = calculateBoukaLimit(
            boukaJukouDate, 
            senninDate, 
            isCheckBousai ? bousaiJukouDate : null
        );
        
        let limitDate = boukaResult.limitDate;
        let limitMessage = boukaResult.message;
        let bousaiMsg = '';
        let fusoku2Message = '';
        
        // 附則2号適用時のメッセージを保存
        if (boukaResult.fusoku2Applied) {
            fusoku2Message = '<br/><span style="color: #d32f2f; font-weight: bold;">※ 附則2号特例適用</span>';
        }

        // 防災管理期限計算
        if (isCheckBousai) {
            const bousaiResult = calculateBousaiLimit(bousaiJukouDate, senninDate);
            
            bousaiMsg = `
                <span class="inline">防災受講日：</span>
                <span class="inline">${formatDate(bousaiJukouDate, 'yyyy/MM/dd')}</span><br/>
                ${bousaiResult.message}<br/>
                <b>防災期限は${formatDate(bousaiResult.limitDate, 'yyyy/MM/dd')}【${japaneseDate(bousaiResult.limitDate)}】</b>`;
            
            // 最終的な受講期限は防火と防災の早い方
            // ただし、附則2号が適用されている場合は防火期限メッセージを優先
            if (bousaiResult.limitDate < limitDate && !boukaResult.fusoku2Applied) {
                limitDate = bousaiResult.limitDate;
                limitMessage = `防災管理の期限が先に到来します`;
            }
        }
        
        // 附則2号のメッセージを最後に追加
        if (fusoku2Message) {
            limitMessage += fusoku2Message;
        }

        // タイムラインデータ作成
        const timelineData = createTimelineData(
            boukaJukouDate,
            senninDate,
            bousaiJukouDate,
            limitDate,
            isCheckBousai
        );

        // 結果メッセージ生成
        const resultMessage = createResultMessage(
            boukaJukouDate,
            senninDate,
            limitDate,
            limitMessage,
            bousaiMsg
        );

        // UI更新
        msg.innerHTML = resultMessage;
        renderTimeline(timelineData);
    } catch (e) {
        console.error("エラー：", e.message);
        msg.innerHTML = `エラー
        <div class="error">${e.message}</div>`;
    }
}

const msg = document.getElementById('msg');

const checkButton = document.getElementById('checkButton');
checkButton.addEventListener('click', buttonClick);

// ========== 和暦入力機能の初期化 ==========

/**
 * セレクトボックスを初期化（月と日）
 */
function initializeDateSelects() {
    const monthSelects = document.querySelectorAll('.month-select');
    const daySelects = document.querySelectorAll('.day-select');
    
    // 月のオプションを生成（1-12）
    monthSelects.forEach(select => {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}月`;
            select.appendChild(option);
        }
    });
    
    // 日のオプションを生成（1-31）
    daySelects.forEach(select => {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}日`;
            select.appendChild(option);
        }
    });
}

/**
 * 元号セレクトボックスを初期化
 */
function initializeEraSelects() {
    const eras = getAvailableEras();
    const eraSelects = document.querySelectorAll('.era-select');
    
    eraSelects.forEach(select => {
        eras.forEach(era => {
            const option = document.createElement('option');
            option.value = era.name;
            option.textContent = era.name;
            select.appendChild(option);
        });
    });
}

/**
 * 西暦入力から和暦入力を更新
 * @param {string} westernId - 西暦入力のID
 * @param {string} prefix - 和暦入力のプレフィックス（sennin, bouka, bousai）
 */
function updateJapaneseFromWestern(westernId, prefix) {
    const westernInput = document.getElementById(westernId);
    const dateString = westernInput.value; // 'YYYY-MM-DD' 形式の文字列
    
    const eraSelect = document.getElementById(`${prefix}Era`);
    const yearInput = document.getElementById(`${prefix}Year`);
    const monthSelect = document.getElementById(`${prefix}Month`);
    const daySelect = document.getElementById(`${prefix}Day`);
    const errorDiv = document.getElementById(`${prefix}Error`);
    
    // エラーメッセージをクリア
    if (errorDiv) {
        errorDiv.textContent = '';
    }
    
    if (dateString) {
        // 文字列から年月日をパース（タイムゾーンの影響を受けない）
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        const jpDate = getJapaneseEra(date);
        if (jpDate) {
            eraSelect.value = jpDate.era;
            yearInput.value = jpDate.year;
            monthSelect.value = jpDate.month;
            daySelect.value = jpDate.day;
        }
    } else {
        // 空欄の場合は和暦もクリア
        eraSelect.value = '';
        yearInput.value = '';
        monthSelect.value = '';
        daySelect.value = '';
    }
}

/**
 * 和暦入力から西暦入力を更新
 * @param {string} westernId - 西暦入力のID
 * @param {string} prefix - 和暦入力のプレフィックス（sennin, bouka, bousai）
 */
function updateWesternFromJapanese(westernId, prefix) {
    const eraSelect = document.getElementById(`${prefix}Era`);
    const yearInput = document.getElementById(`${prefix}Year`);
    const monthSelect = document.getElementById(`${prefix}Month`);
    const daySelect = document.getElementById(`${prefix}Day`);
    const errorDiv = document.getElementById(`${prefix}Error`);
    
    const era = eraSelect.value;
    const year = parseInt(yearInput.value);
    const month = parseInt(monthSelect.value);
    const day = parseInt(daySelect.value);
    
    // エラーメッセージをクリア
    if (errorDiv) {
        errorDiv.textContent = '';
    }
    
    if (era && year && month && day) {
        const date = japaneseToDate(era, year, month, day);
        if (date) {
            const westernInput = document.getElementById(westernId);
            // YYYY-MM-DD形式の文字列で設定（タイムゾーンの影響を受けない）
            const dateString = formatDate(date, 'yyyy-MM-dd');
            westernInput.value = dateString;
        } else {
            // 変換できない日付の場合はエラーを表示
            if (errorDiv) {
                errorDiv.textContent = `⚠ ${era}${year}年${month}月${day}日は存在しない日付です`;
            }
            // 西暦入力もクリア
            const westernInput = document.getElementById(westernId);
            westernInput.value = '';
        }
    }
}

/**
 * イベントリスナーを設定
 * @param {string} westernId - 西暦入力のID
 * @param {string} prefix - 和暦入力のプレフィックス
 */
function setupDateSync(westernId, prefix) {
    // 西暦→和暦の同期
    const westernInput = document.getElementById(westernId);
    if (!westernInput) {
        return;
    }
    
    westernInput.addEventListener('change', () => {
        updateJapaneseFromWestern(westernId, prefix);
    });
    
    // 和暦→西暦の同期
    const eraSelect = document.getElementById(`${prefix}Era`);
    const yearInput = document.getElementById(`${prefix}Year`);
    const monthSelect = document.getElementById(`${prefix}Month`);
    const daySelect = document.getElementById(`${prefix}Day`);
    
    if (!eraSelect || !yearInput || !monthSelect || !daySelect) {
        return;
    }
    
    [eraSelect, yearInput, monthSelect, daySelect].forEach(element => {
        element.addEventListener('change', () => {
            updateWesternFromJapanese(westernId, prefix);
        });
        // input イベントも追加（yearInputの即座な反応のため）
        if (element === yearInput) {
            element.addEventListener('input', () => {
                updateWesternFromJapanese(westernId, prefix);
            });
        }
    });
}

// 初期化処理
function initializeApp() {
    initializeDateSelects();
    initializeEraSelects();
    
    // 各日付フィールドの同期設定
    setupDateSync('senninDate', 'sennin');
    setupDateSync('boukaJukouDate', 'bouka');
    setupDateSync('bousaiJukouDate', 'bousai');
}

// DOMの読み込みが完了してから初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // すでにDOMが読み込まれている場合は即座に実行
    initializeApp();
}
