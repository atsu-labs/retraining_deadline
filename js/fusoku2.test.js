/**
 * 附則2号適用条件のテスト
 * 
 * 附則2号は以下の条件を全て満たす場合にのみ適用されるべき：
 * 1. 防災管理講習を受講している
 * 2. 防災管理講習日が防火管理講習日より後
 * 3. 防火管理の期限が防災管理の期限より早い
 * 4. 防火管理の期限が「5年ルール」で計算されている（選任日が防火受講日から4年以内）
 */

// script.jsから関数をインポートするためのモック
// 実際のテストではscript.jsを直接テストできないため、
// ここではロジックの検証用のヘルパー関数を作成

import { dateAfterYear, nextApril1st, previousDay, formatDate } from './dateUtils.js';

// calculateBoukaLimitのロジックを再現
function calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate = null) {
    const YEARS_BEFORE_SENNIN = -4;
    const YEARS_FOR_LIMIT = 5;
    const ONE_YEAR = 1;
    
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
    // 防災管理も4月1日起算となったため、附則2号の適用条件を確認
    if (bousaiJukouDate !== null && bousaiJukouDate > boukaJukouDate) {
        // 防災管理講習期限を計算
        const senninBefore4yForBousai = dateAfterYear(senninDate, YEARS_BEFORE_SENNIN);
        let bousaiLimit;
        
        if (senninBefore4yForBousai > bousaiJukouDate) {
            // 防災：選任日から1年以内
            bousaiLimit = previousDay(dateAfterYear(senninDate, ONE_YEAR));
        } else {
            // 防災：防災受講日の次の4月1日から5年
            bousaiLimit = previousDay(dateAfterYear(nextApril1st(bousaiJukouDate), YEARS_FOR_LIMIT));
        }
        
        // 附則2号適用条件：防火期限が防災期限より早い場合
        if (limitDate < bousaiLimit) {
            // 附則2号：防災管理新規講習の次の4月1日から5年（通常の防災計算と同じ）
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

describe('附則2号の適用条件テスト', () => {
    test('問題のケース：選任日が防火受講日から4年以内でない場合、附則2号は適用されない', () => {
        // 選任日：2025/11/06
        // 防火受講日：2016/06/06
        // 防災受講日：2022/03/01
        const senninDate = new Date(2025, 10, 6);      // 2025年11月6日
        const boukaJukouDate = new Date(2016, 5, 6);   // 2016年6月6日
        const bousaiJukouDate = new Date(2022, 2, 1);  // 2022年3月1日
        
        const result = calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate);
        
        // 選任日から4年前は 2021/11/06
        // 防火受講日 2016/06/06 は選任日から4年以上前
        // → 選任から1年以内ルールが適用されるべき
        // → 附則2号は適用されないべき
        expect(result.isBouka5years).toBe(false);
        expect(result.fusoku2Applied).toBe(false);
        
        // 期限は選任日から1年以内（2026/11/05）であるべき
        const expectedLimit = new Date(2026, 10, 5); // 2026年11月5日
        expect(formatDate(result.limitDate, 'yyyy/MM/dd')).toBe(formatDate(expectedLimit, 'yyyy/MM/dd'));
    });
    
    test('附則2号が適用されるべきケース：選任日が防火受講日から4年以内の場合', () => {
        // 選任日：2023/04/01
        // 防火受講日：2019/06/06（選任から4年以内）
        // 防災受講日：2022/03/01
        const senninDate = new Date(2023, 3, 1);       // 2023年4月1日
        const boukaJukouDate = new Date(2019, 5, 6);   // 2019年6月6日
        const bousaiJukouDate = new Date(2022, 2, 1);  // 2022年3月1日
        
        const result = calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate);
        
        // 選任日から4年前は 2019/04/01
        // 防火受講日 2019/06/06 は選任日から4年以内
        // → 5年ルールが適用される
        expect(result.isBouka5years).toBe(true);
        
        // 防火期限：2019/06/06の次の4/1 → 2020/04/01から5年 → 2025/03/31
        const boukaLimit = new Date(2025, 2, 31); // 2025年3月31日
        
        // 防災期限：2022/03/01の次の4/1 → 2022/04/01から5年 → 2027/03/31
        const bousaiLimit = new Date(2027, 2, 31); // 2027年3月31日
        
        // 防火期限 < 防災期限なので附則2号が適用される可能性がある
        // 附則2号適用後の期限は防災管理講習日基準の2027/03/31になるべき
        expect(result.fusoku2Applied).toBe(true);
        expect(formatDate(result.limitDate, 'yyyy/MM/dd')).toBe(formatDate(bousaiLimit, 'yyyy/MM/dd'));
    });
    
    test('防災受講日が防火受講日より前の場合、附則2号は適用されない', () => {
        // 選任日：2023/04/01
        // 防火受講日：2022/06/06
        // 防災受講日：2019/03/01（防火より前）
        const senninDate = new Date(2023, 3, 1);       // 2023年4月1日
        const boukaJukouDate = new Date(2022, 5, 6);   // 2022年6月6日
        const bousaiJukouDate = new Date(2019, 2, 1);  // 2019年3月1日
        
        const result = calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate);
        
        // 防災受講日が防火受講日より前なので附則2号は適用されない
        expect(result.fusoku2Applied).toBe(false);
    });
    
    test('防災チェックがない場合、附則2号は適用されない', () => {
        // 選任日：2023/04/01
        // 防火受講日：2019/06/06
        // 防災受講日：なし
        const senninDate = new Date(2023, 3, 1);       // 2023年4月1日
        const boukaJukouDate = new Date(2019, 5, 6);   // 2019年6月6日
        
        const result = calculateBoukaLimit(boukaJukouDate, senninDate, null);
        
        // 防災がないので附則2号は適用されない
        expect(result.fusoku2Applied).toBe(false);
    });
    
    test('防火期限が防災期限より遅い場合、附則2号は適用されない', () => {
        // 選任日：2023/04/01
        // 防火受講日：2022/06/06（最近）
        // 防災受講日：2019/03/01（古い）
        const senninDate = new Date(2023, 3, 1);       // 2023年4月1日
        const boukaJukouDate = new Date(2022, 5, 6);   // 2022年6月6日
        const bousaiJukouDate = new Date(2019, 2, 1);  // 2019年3月1日
        
        const result = calculateBoukaLimit(boukaJukouDate, senninDate, bousaiJukouDate);
        
        // 防火期限：2022/06/06の次の4/1 → 2023/04/01から5年 → 2028/03/31
        // 防災期限：2019/03/01の次の4/1 → 2019/04/01から5年 → 2024/03/31
        // 防火期限 > 防災期限なので附則2号は適用されない
        expect(result.fusoku2Applied).toBe(false);
    });
});
