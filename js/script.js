import { formatDate, japaneseDate, nextApril1st, dateAfterYear, previousDay } from './dateUtils.js';
import { initializeJapaneseCalendarSync } from './japaneseCalendarSync.js';

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
 * 受講期限を計算
 * @param {Date} boukaJukouDate - 防火受講日
 * @param {Date} senninDate - 選任日
 * @returns {{limitDate: Date, message: string, isBouka5years: boolean}}
 */
function calculateLimit(boukaJukouDate, senninDate) {
    const senninBefore4y = dateAfterYear(senninDate, YEARS_BEFORE_SENNIN);
    
    if (senninBefore4y > boukaJukouDate) {
        // 選任日から過去4年以内に防火受講がない場合
        const limitDate = previousDay(dateAfterYear(senninDate, ONE_YEAR));
        return {
            limitDate,
            message: `選任から1年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`,
            isBouka5years: false
        };
    } else {
        // 選任日から過去4年以内に防火受講がある場合
        const limitDate = previousDay(dateAfterYear(nextApril1st(boukaJukouDate), YEARS_FOR_LIMIT));
        return {
            limitDate,
            message: `防火受講日の次の４月１日から５年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`,
            isBouka5years: true
        };
    }
}

/**
 * 防災管理の特例メッセージを生成
 * @param {Date} boukaJukouDate - 防火受講日
 * @param {Date} bousaiJukouDate - 防災受講日
 * @param {boolean} isBouka5years - 防火5年ルール適用有無
 * @returns {{message: string, limitDate: Date|null}}
 */
function calculateBousaiTokurei(boukaJukouDate, bousaiJukouDate, isBouka5years) {
    const bousaiNextApril = nextApril1st(bousaiJukouDate);
    const boukaAfter4Years = dateAfterYear(boukaJukouDate, 4);
    
    const isTokureiApplicable = 
        boukaJukouDate < bousaiJukouDate &&
        bousaiJukouDate < boukaAfter4Years &&
        isBouka5years;
    
    if (isTokureiApplicable) {
        const limitDate = previousDay(dateAfterYear(bousaiNextApril, YEARS_FOR_LIMIT));
        return {
            limitDate,
            message: `
                <span class="inline">防災受講日：</span>
                <span class="inline">${formatDate(bousaiJukouDate, 'yyyy/MM/dd')}</span><br/>
                <span class="inline">防災受講日の次の4/1：</span>
                <span class="inline">${formatDate(bousaiNextApril, 'yyyy/MM/dd')}</span><br/>
            再講習の延長特例適用です<br/>
            防災受講日の次の４月１日から５年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`
        };
    } else {
        return {
            limitDate: null,
            message: `
                <span class="inline">防災受講日：</span>
                <span class="inline">${formatDate(bousaiJukouDate, 'yyyy/MM/dd')}</span><br/>
                <span class="inline">防災受講日の次の4/1：</span>
                <span class="inline">${formatDate(bousaiNextApril, 'yyyy/MM/dd')}</span><br/>
            
            再講習の延長特例適用外です`
        };
    }
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

        // 期限計算
        const { limitDate: calculatedLimit, message: limitMessage, isBouka5years } = calculateLimit(boukaJukouDate, senninDate);
        let limitDate = calculatedLimit;
        let tokureiMsg = '';

        // 防災管理の特例チェック
        if (isCheckBousai) {
            const tokurei = calculateBousaiTokurei(boukaJukouDate, bousaiJukouDate, isBouka5years);
            if (tokurei.limitDate) {
                limitDate = tokurei.limitDate;
            }
            tokureiMsg = tokurei.message;
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
            tokureiMsg
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

// 和暦・西暦フォームの同期を初期化
initializeJapaneseCalendarSync();
