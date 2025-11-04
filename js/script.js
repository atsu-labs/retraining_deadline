import { formatDate, japaneseDate, nextApril1st, dateAfterYear, previousDay } from './dateUtils.js';

function buttonClick() {
    document.getElementById('visualization').innerHTML = '';

    const boukaJukouDate = document.getElementById('boukaJukouDate').valueAsDate;
    const senninDate = document.getElementById('senninDate').valueAsDate;
    const bousaiJukouDate = document.getElementById('bousaiJukouDate').valueAsDate;
    const isCheckBousai = document.getElementById('isCheckBousai').checked;

    try {
        if (boukaJukouDate === null | senninDate === null) {
            throw new Error('防火受講日・選任日が空欄または不正な値です')
        }
        const senninBefore4y = dateAfterYear(senninDate, -4);
        const boukaJukouDateNextAplil1st = nextApril1st(boukaJukouDate);
        let isBouka5years = false;
        let tokureiMsg;
        let limitDate;
        let msg2;

        if (senninBefore4y > boukaJukouDate) {
            isBouka5years = false;
            limitDate = previousDay(dateAfterYear(senninDate, 1));
            msg2 = `選任から1年以内に受講が必要(${formatDate(previousDay(dateAfterYear(senninDate, 1)), 'yyyy/MM/dd')})`
        } else {
            isBouka5years = true;
            limitDate = previousDay(dateAfterYear(nextApril1st(boukaJukouDate), 5));
            msg2 = `防火受講日の次の４月１日から５年以内に受講が必要(${formatDate(previousDay(dateAfterYear(nextApril1st(boukaJukouDate), 5)), 'yyyy/MM/dd')})`
        }




        // DOM element where the Timeline will be attached
        var container = document.getElementById('visualization');
        const groups = [
            { id: 'date1', content: '日付' },
            { id: 'date2', content: '日付' },
            { id: 'term', content: '期間' }
        ];
        let data = [
            {
                id: 1, group: 'date1', content: '防火受講日', title: formatDate(boukaJukouDate, 'yyyy-MM-dd'),
                start: formatDate(boukaJukouDate, 'yyyy-MM-dd'), style: "background-color:pink;"
            },
            {
                id: 2, group: 'date1', content: '選任日', title: formatDate(senninDate, 'yyyy-MM-dd'),
                start: formatDate(senninDate, 'yyyy-MM-dd'), style: "background-color:pink;"
            },
            {
                id: 3, group: 'date2', content: '防火受講日の次の4/1',
                start: formatDate(boukaJukouDateNextAplil1st, 'yyyy-MM-dd')
            },
            {
                id: 4, group: 'term', content: '選任日から過去４年間',
                start: formatDate(senninBefore4y, 'yyyy/MM/dd'), end: formatDate(senninDate, 'yyyy-MM-dd')
            },
            {
                id: 5, group: 'term', content: '防火受講日の次の4/1から5年間',
                start: formatDate(boukaJukouDateNextAplil1st, 'yyyy-MM-dd'), end: formatDate(previousDay(dateAfterYear(nextApril1st(boukaJukouDate), 5)), 'yyyy/MM/dd')
            },
            {
                id: 6, group: 'term', content: '選任日から1年間',
                start: formatDate(senninDate, 'yyyy-MM-dd'), end: formatDate(previousDay(dateAfterYear(senninDate, 1)), 'yyyy-MM-dd')
            }
        ];
        if (isCheckBousai) {
            if (bousaiJukouDate === null) {
                throw new Error('防災管理講習受講日が空欄または不正な値です')
            }
            data.push(
                {
                    id: 7, group: 'date1', content: '防災受講日', title: formatDate(bousaiJukouDate, 'yyyy-MM-dd'),
                    start: formatDate(bousaiJukouDate, 'yyyy-MM-dd'), style: "background-color:pink;"
                },
                { id: 8, group: 'date2', content: '防災受講日の次の4/1', start: formatDate(nextApril1st(bousaiJukouDate), 'yyyy-MM-dd') },
                {
                    id: 9, group: 'term', content: '防災受講日の次の4/1から5年間',
                    start: formatDate(nextApril1st(bousaiJukouDate), 'yyyy-MM-dd'),
                    end: formatDate(previousDay(dateAfterYear(nextApril1st(bousaiJukouDate), 5)), 'yyyy/MM/dd')
                }
            )
            if (boukaJukouDate < bousaiJukouDate &
                bousaiJukouDate < dateAfterYear(boukaJukouDate, 4) &
                isBouka5years) {
                limitDate = previousDay(dateAfterYear(nextApril1st(bousaiJukouDate), 5));
                tokureiMsg = `
                <span class="inline">防災受講日：</span>
                <span class="inline">${formatDate(bousaiJukouDate, 'yyyy/MM/dd')}</span><br/>
                <span class="inline">防災受講日の次の4/1：</span>
                <span class="inline">${formatDate(nextApril1st(bousaiJukouDate), 'yyyy/MM/dd')}</span><br/>
            再講習の延長特例適用です<br/>
            防災受講日の次の４月１日から５年以内に受講が必要(${formatDate(limitDate, 'yyyy/MM/dd')})`;
            } else {
                tokureiMsg = `
                <span class="inline">防災受講日：</span>
                <span class="inline">${formatDate(bousaiJukouDate, 'yyyy/MM/dd')}</span><br/>
                <span class="inline">防災受講日の次の4/1：</span>
                <span class="inline">${formatDate(nextApril1st(bousaiJukouDate), 'yyyy/MM/dd')}</span><br/>
            
            再講習の延長特例適用外です`
            }
        } else {
            tokureiMsg = ""
        }
        data.push(
            {
                id: 99, group: 'date1', content: '受講期日', title: formatDate(limitDate, 'yyyy-MM-dd'),
                start: formatDate(limitDate, 'yyyy-MM-dd'), style: "background-color:red;"
            }
        )

        msg.innerHTML = `
        <span class="inline">選任日：</span>
        <span class="inline">${formatDate(senninDate, 'yyyy/MM/dd')}</span><br/>
        <span class="inline">選任日の４年前：</span>
        <span class="inline">${formatDate(senninBefore4y, 'yyyy/MM/dd')}</span><br/>
        <span class="inline">防火受講日：</span>
        <span class="inline">${formatDate(boukaJukouDate, 'yyyy/MM/dd')}</span><br/>
        <span class="inline">防火受講日の次の4/1：</span>
        <span class="inline">${formatDate(nextApril1st(boukaJukouDate), 'yyyy/MM/dd')}</span><br/>
        ${msg2}<br/>
        <br/>
        <p>${tokureiMsg}</p>
        <b>期限は${formatDate(limitDate, 'yyyy/MM/dd')}【${japaneseDate(limitDate)}】</b>`;
        // Create a DataSet (allows two way data-binding)
        const items = new vis.DataSet(data);

        // Configuration for the Timeline
        const options = { showCurrentTime: false };

        // Create a Timeline
        const timeline = new vis.Timeline(container, items, groups, options);
    } catch (e) {
        console.error("エラー：", e.message);
        msg.innerHTML = `エラー
        <div class="error">${e.message}</div>`
    }
};

// ユーティリティ関数はdateUtils.jsからインポート

const msg = document.getElementById('msg');

const checkButton = document.getElementById('checkButton');
checkButton.addEventListener('click', buttonClick);
