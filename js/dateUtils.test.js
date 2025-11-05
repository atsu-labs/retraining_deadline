/**
 * 日付ユーティリティ関数のテスト
 * 
 * テスト対象:
 * - nextApril1st: 次の4月1日の計算
 * - dateAfterYear: 年数加算
 * - previousDay: 前日の取得
 * - formatDate: 日付フォーマット
 * - japaneseDate: 和暦変換
 */

import {
    nextApril1st,
    dateAfterYear,
    previousDay,
    formatDate,
    japaneseDate,
    getJapaneseEra,
    japaneseToDate,
    getAvailableEras
} from './dateUtils';

describe('nextApril1st', () => {
    test('1月の日付から次の4月1日を取得', () => {
        const input = new Date(2023, 0, 15); // 2023年1月15日
        const result = nextApril1st(input);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(3); // 4月 (0-indexed)
        expect(result.getDate()).toBe(1);
    });

    test('3月の日付から次の4月1日を取得', () => {
        const input = new Date(2023, 2, 31); // 2023年3月31日
        const result = nextApril1st(input);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(3);
        expect(result.getDate()).toBe(1);
    });

    test('4月1日から次の4月1日を取得（翌年）', () => {
        const input = new Date(2023, 3, 1); // 2023年4月1日
        const result = nextApril1st(input);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(3);
        expect(result.getDate()).toBe(1);
    });

    test('4月2日から次の4月1日を取得（翌年）', () => {
        const input = new Date(2023, 3, 2); // 2023年4月2日
        const result = nextApril1st(input);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(3);
        expect(result.getDate()).toBe(1);
    });

    test('12月の日付から次の4月1日を取得（翌年）', () => {
        const input = new Date(2023, 11, 25); // 2023年12月25日
        const result = nextApril1st(input);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(3);
        expect(result.getDate()).toBe(1);
    });

    test('元の日付が変更されないこと', () => {
        const input = new Date(2023, 5, 15);
        const originalTime = input.getTime();
        nextApril1st(input);
        expect(input.getTime()).toBe(originalTime);
    });
});

describe('dateAfterYear', () => {
    test('1年後の日付を取得', () => {
        const input = new Date(2023, 5, 15); // 2023年6月15日
        const result = dateAfterYear(input, 1);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(15);
    });

    test('5年後の日付を取得', () => {
        const input = new Date(2023, 5, 15);
        const result = dateAfterYear(input, 5);
        expect(result.getFullYear()).toBe(2028);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(15);
    });

    test('4年前の日付を取得（負の値）', () => {
        const input = new Date(2023, 5, 15);
        const result = dateAfterYear(input, -4);
        expect(result.getFullYear()).toBe(2019);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(15);
    });

    test('0年後は同じ日付', () => {
        const input = new Date(2023, 5, 15);
        const result = dateAfterYear(input, 0);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(15);
    });

    test('閏年を跨ぐ計算（2月29日）', () => {
        const input = new Date(2020, 1, 29); // 2020年2月29日（閏年）
        const result = dateAfterYear(input, 1);
        expect(result.getFullYear()).toBe(2021);
        // JavaScriptは閏年の2月29日に1年加算すると3月1日になる
        expect(result.getMonth()).toBe(2); // 3月
        expect(result.getDate()).toBe(1);
    });

    test('元の日付が変更されないこと', () => {
        const input = new Date(2023, 5, 15);
        const originalTime = input.getTime();
        dateAfterYear(input, 3);
        expect(input.getTime()).toBe(originalTime);
    });
});

describe('previousDay', () => {
    test('月の途中の前日を取得', () => {
        const input = new Date(2023, 5, 15); // 2023年6月15日
        const result = previousDay(input);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(14);
    });

    test('月初（1日）の前日を取得（前月末）', () => {
        const input = new Date(2023, 6, 1); // 2023年7月1日
        const result = previousDay(input);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(5); // 6月
        expect(result.getDate()).toBe(30);
    });

    test('1月1日の前日を取得（前年12月31日）', () => {
        const input = new Date(2023, 0, 1); // 2023年1月1日
        const result = previousDay(input);
        expect(result.getFullYear()).toBe(2022);
        expect(result.getMonth()).toBe(11); // 12月
        expect(result.getDate()).toBe(31);
    });

    test('閏年2月の計算', () => {
        const input = new Date(2020, 2, 1); // 2020年3月1日
        const result = previousDay(input);
        expect(result.getFullYear()).toBe(2020);
        expect(result.getMonth()).toBe(1); // 2月
        expect(result.getDate()).toBe(29); // 閏年なので29日
    });

    test('平年2月の計算', () => {
        const input = new Date(2021, 2, 1); // 2021年3月1日
        const result = previousDay(input);
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(1); // 2月
        expect(result.getDate()).toBe(28); // 平年なので28日
    });

    test('元の日付が変更されないこと', () => {
        const input = new Date(2023, 5, 15);
        const originalTime = input.getTime();
        previousDay(input);
        expect(input.getTime()).toBe(originalTime);
    });
});

describe('formatDate', () => {
    const testDate = new Date(2023, 5, 15, 14, 30, 45, 123); // 2023年6月15日 14:30:45.123

    test('yyyy/MM/dd形式でフォーマット', () => {
        const result = formatDate(testDate, 'yyyy/MM/dd');
        expect(result).toBe('2023/06/15');
    });

    test('yyyy-MM-dd形式でフォーマット', () => {
        const result = formatDate(testDate, 'yyyy-MM-dd');
        expect(result).toBe('2023-06-15');
    });

    test('yyyy/MM/dd HH:mm:ss形式でフォーマット', () => {
        const result = formatDate(testDate, 'yyyy/MM/dd HH:mm:ss');
        expect(result).toBe('2023/06/15 14:30:45');
    });

    test('ミリ秒を含むフォーマット', () => {
        const result = formatDate(testDate, 'yyyy-MM-dd HH:mm:ss.SSS');
        expect(result).toBe('2023-06-15 14:30:45.123');
    });

    test('1桁の月・日のゼロパディング', () => {
        const date = new Date(2023, 0, 5); // 2023年1月5日
        const result = formatDate(date, 'yyyy/MM/dd');
        expect(result).toBe('2023/01/05');
    });

    test('1桁の時・分・秒のゼロパディング', () => {
        const date = new Date(2023, 5, 15, 9, 5, 3); // 09:05:03
        const result = formatDate(date, 'HH:mm:ss');
        expect(result).toBe('09:05:03');
    });

    test('カスタムフォーマット', () => {
        const result = formatDate(testDate, 'yyyy年MM月dd日');
        expect(result).toBe('2023年06月15日');
    });

    test('時刻のみのフォーマット', () => {
        const result = formatDate(testDate, 'HH:mm');
        expect(result).toBe('14:30');
    });
});

describe('japaneseDate', () => {
    test('令和の日付を和暦で取得', () => {
        const date = new Date(2023, 5, 15); // 2023年6月15日
        const result = japaneseDate(date);
        // 令和5年6月15日の形式
        expect(result).toContain('令和');
        expect(result).toContain('5年');
        expect(result).toContain('6月');
        expect(result).toContain('15日');
    });

    test('令和元年の日付', () => {
        const date = new Date(2019, 5, 1); // 2019年6月1日
        const result = japaneseDate(date);
        expect(result).toContain('令和');
        expect(result).toContain('元年');
    });

    test('平成の日付を和暦で取得', () => {
        const date = new Date(2018, 11, 31); // 2018年12月31日
        const result = japaneseDate(date);
        expect(result).toContain('平成');
        expect(result).toContain('30年');
    });

    test('和暦形式の文字列であることを確認', () => {
        const date = new Date(2023, 5, 15);
        const result = japaneseDate(date);
        // 日本語の文字が含まれていることを確認
        expect(result).toMatch(/[年月日]/);
    });
});

describe('getJapaneseEra: 西暦→和暦変換', () => {
    test('令和の開始日（2019年5月1日）', () => {
        const date = new Date(2019, 4, 1); // 2019年5月1日
        const result = getJapaneseEra(date);
        expect(result).toEqual({
            era: '令和',
            year: 1,
            month: 5,
            day: 1
        });
    });

    test('令和5年11月5日', () => {
        const date = new Date(2023, 10, 5); // 2023年11月5日
        const result = getJapaneseEra(date);
        expect(result).toEqual({
            era: '令和',
            year: 5,
            month: 11,
            day: 5
        });
    });

    test('平成最終日（2019年4月30日）', () => {
        const date = new Date(2019, 3, 30); // 2019年4月30日
        const result = getJapaneseEra(date);
        expect(result).toEqual({
            era: '平成',
            year: 31,
            month: 4,
            day: 30
        });
    });

    test('平成元年（1989年1月8日）', () => {
        const date = new Date(1989, 0, 8); // 1989年1月8日
        const result = getJapaneseEra(date);
        expect(result).toEqual({
            era: '平成',
            year: 1,
            month: 1,
            day: 8
        });
    });

    test('昭和最終日（1989年1月7日）', () => {
        const date = new Date(1989, 0, 7); // 1989年1月7日
        const result = getJapaneseEra(date);
        expect(result).toEqual({
            era: '昭和',
            year: 64,
            month: 1,
            day: 7
        });
    });
});

describe('japaneseToDate: 和暦→西暦変換', () => {
    test('令和5年11月5日 → 2023年11月5日', () => {
        const result = japaneseToDate('令和', 5, 11, 5);
        expect(result).not.toBeNull();
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(10); // 0-indexed なので10が11月
        expect(result.getDate()).toBe(5);
    });

    test('令和元年5月1日 → 2019年5月1日', () => {
        const result = japaneseToDate('令和', 1, 5, 1);
        expect(result).not.toBeNull();
        expect(result.getFullYear()).toBe(2019);
        expect(result.getMonth()).toBe(4); // 5月
        expect(result.getDate()).toBe(1);
    });

    test('平成31年4月30日 → 2019年4月30日', () => {
        const result = japaneseToDate('平成', 31, 4, 30);
        expect(result).not.toBeNull();
        expect(result.getFullYear()).toBe(2019);
        expect(result.getMonth()).toBe(3); // 4月
        expect(result.getDate()).toBe(30);
    });

    test('存在しない日付: 令和1年1月1日（令和開始前）', () => {
        const result = japaneseToDate('令和', 1, 1, 1);
        expect(result).toBeNull();
    });

    test('存在しない日付: 令和1年4月1日（令和開始前）', () => {
        const result = japaneseToDate('令和', 1, 4, 1);
        expect(result).toBeNull();
    });

    test('存在しない日付: 平成32年1月1日（平成終了後）', () => {
        const result = japaneseToDate('平成', 32, 1, 1);
        expect(result).toBeNull();
    });

    test('無効な月日: 13月1日', () => {
        const result = japaneseToDate('令和', 5, 13, 1);
        expect(result).toBeNull();
    });

    test('無効な月日: 2月30日', () => {
        const result = japaneseToDate('令和', 5, 2, 30);
        expect(result).toBeNull();
    });

    test('存在しない元号', () => {
        const result = japaneseToDate('存在しない', 1, 1, 1);
        expect(result).toBeNull();
    });
});

describe('和暦⇔西暦の往復変換', () => {
    test('令和5年11月5日の往復変換', () => {
        const originalDate = new Date(2023, 10, 5);
        const jpDate = getJapaneseEra(originalDate);
        const convertedDate = japaneseToDate(jpDate.era, jpDate.year, jpDate.month, jpDate.day);
        
        expect(convertedDate.getFullYear()).toBe(originalDate.getFullYear());
        expect(convertedDate.getMonth()).toBe(originalDate.getMonth());
        expect(convertedDate.getDate()).toBe(originalDate.getDate());
    });

    test('令和開始日の往復変換', () => {
        const originalDate = new Date(2019, 4, 1); // 2019年5月1日
        const jpDate = getJapaneseEra(originalDate);
        const convertedDate = japaneseToDate(jpDate.era, jpDate.year, jpDate.month, jpDate.day);
        
        expect(convertedDate.getFullYear()).toBe(originalDate.getFullYear());
        expect(convertedDate.getMonth()).toBe(originalDate.getMonth());
        expect(convertedDate.getDate()).toBe(originalDate.getDate());
    });

    test('平成最終日の往復変換', () => {
        const originalDate = new Date(2019, 3, 30); // 2019年4月30日
        const jpDate = getJapaneseEra(originalDate);
        const convertedDate = japaneseToDate(jpDate.era, jpDate.year, jpDate.month, jpDate.day);
        
        expect(convertedDate.getFullYear()).toBe(originalDate.getFullYear());
        expect(convertedDate.getMonth()).toBe(originalDate.getMonth());
        expect(convertedDate.getDate()).toBe(originalDate.getDate());
    });

    test('月初（1日）の往復変換', () => {
        const originalDate = new Date(2023, 0, 1); // 2023年1月1日
        const jpDate = getJapaneseEra(originalDate);
        const convertedDate = japaneseToDate(jpDate.era, jpDate.year, jpDate.month, jpDate.day);
        
        expect(convertedDate.getFullYear()).toBe(originalDate.getFullYear());
        expect(convertedDate.getMonth()).toBe(originalDate.getMonth());
        expect(convertedDate.getDate()).toBe(originalDate.getDate());
    });

    test('月末（31日）の往復変換', () => {
        const originalDate = new Date(2023, 0, 31); // 2023年1月31日
        const jpDate = getJapaneseEra(originalDate);
        const convertedDate = japaneseToDate(jpDate.era, jpDate.year, jpDate.month, jpDate.day);
        
        expect(convertedDate.getFullYear()).toBe(originalDate.getFullYear());
        expect(convertedDate.getMonth()).toBe(originalDate.getMonth());
        expect(convertedDate.getDate()).toBe(originalDate.getDate());
    });

    test('2月29日（閏年）の往復変換', () => {
        const originalDate = new Date(2024, 1, 29); // 2024年2月29日
        const jpDate = getJapaneseEra(originalDate);
        const convertedDate = japaneseToDate(jpDate.era, jpDate.year, jpDate.month, jpDate.day);
        
        expect(convertedDate.getFullYear()).toBe(originalDate.getFullYear());
        expect(convertedDate.getMonth()).toBe(originalDate.getMonth());
        expect(convertedDate.getDate()).toBe(originalDate.getDate());
    });
});

describe('getAvailableEras', () => {
    test('元号リストが取得できること', () => {
        const result = getAvailableEras();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
    });

    test('令和が含まれること', () => {
        const result = getAvailableEras();
        const reiwa = result.find(era => era.name === '令和');
        expect(reiwa).toBeDefined();
        expect(reiwa.nameShort).toBe('R');
    });

    test('平成が含まれること', () => {
        const result = getAvailableEras();
        const heisei = result.find(era => era.name === '平成');
        expect(heisei).toBeDefined();
        expect(heisei.nameShort).toBe('H');
    });
});

describe('統合テスト: 実際のユースケース', () => {
    test('選任日から4年前の日付計算', () => {
        const senninDate = new Date(2023, 3, 1); // 2023年4月1日
        const senninBefore4y = dateAfterYear(senninDate, -4);
        expect(formatDate(senninBefore4y, 'yyyy/MM/dd')).toBe('2019/04/01');
    });

    test('防火受講日の次の4月1日から5年後の前日', () => {
        const boukaJukouDate = new Date(2019, 2, 6); // 2019年3月6日
        const nextApril = nextApril1st(boukaJukouDate);
        const after5years = dateAfterYear(nextApril, 5);
        const limitDate = previousDay(after5years);
        expect(formatDate(limitDate, 'yyyy/MM/dd')).toBe('2024/03/31');
    });

    test('選任日から1年後の前日（受講期限）', () => {
        const senninDate = new Date(2023, 3, 1); // 2023年4月1日
        const oneYearLater = dateAfterYear(senninDate, 1);
        const limitDate = previousDay(oneYearLater);
        expect(formatDate(limitDate, 'yyyy/MM/dd')).toBe('2024/03/31');
    });

    test('複数の関数を組み合わせた計算', () => {
        // 2019年3月に受講 → 次の4月1日は2019年4月1日 → 5年後は2024年4月1日 → 前日は2024年3月31日
        const jukouDate = new Date(2019, 2, 15);
        const result = previousDay(dateAfterYear(nextApril1st(jukouDate), 5));
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(2); // 3月
        expect(result.getDate()).toBe(31);
    });

    test('防災管理講習は4月1日起算なし', () => {
        // 防災管理は講習日から直接5年
        const bousaiDate = new Date(2020, 5, 15); // 2020年6月15日
        const limit = previousDay(dateAfterYear(bousaiDate, 5));
        expect(formatDate(limit, 'yyyy/MM/dd')).toBe('2025/06/14');
        
        // 防火管理と比較（4月1日起算あり）
        const boukaDate = new Date(2020, 5, 15); // 2020年6月15日
        const boukaNextApril = nextApril1st(boukaDate);
        const boukaLimit = previousDay(dateAfterYear(boukaNextApril, 5));
        expect(formatDate(boukaLimit, 'yyyy/MM/dd')).toBe('2026/03/31');
        
        // 防災の方が早く期限が来る
        expect(limit < boukaLimit).toBe(true);
    });
});
