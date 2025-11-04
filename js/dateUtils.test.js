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
    toJapaneseCalendar,
    fromJapaneseCalendar,
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
});

describe('和暦変換機能', () => {
    describe('toJapaneseCalendar', () => {
        test('令和の日付を和暦に変換', () => {
            const date = new Date(2023, 5, 15); // 2023年6月15日
            const result = toJapaneseCalendar(date);
            expect(result.era).toBe('令和');
            expect(result.year).toBe(5);
            expect(result.month).toBe(6);
            expect(result.day).toBe(15);
        });

        test('令和元年の日付', () => {
            const date = new Date(2019, 4, 1); // 2019年5月1日
            const result = toJapaneseCalendar(date);
            expect(result.era).toBe('令和');
            expect(result.year).toBe(1);
            expect(result.month).toBe(5);
            expect(result.day).toBe(1);
        });

        test('平成の日付を和暦に変換', () => {
            const date = new Date(2019, 3, 30); // 2019年4月30日
            const result = toJapaneseCalendar(date);
            expect(result.era).toBe('平成');
            expect(result.year).toBe(31);
            expect(result.month).toBe(4);
            expect(result.day).toBe(30);
        });

        test('昭和の日付を和暦に変換', () => {
            const date = new Date(1989, 0, 7); // 1989年1月7日
            const result = toJapaneseCalendar(date);
            expect(result.era).toBe('昭和');
            expect(result.year).toBe(64);
            expect(result.month).toBe(1);
            expect(result.day).toBe(7);
        });
    });

    describe('fromJapaneseCalendar', () => {
        test('令和5年6月15日を西暦に変換', () => {
            const date = fromJapaneseCalendar('令和', 5, 6, 15);
            expect(date).not.toBeNull();
            expect(date.getFullYear()).toBe(2023);
            expect(date.getMonth()).toBe(5); // 6月 (0-indexed)
            expect(date.getDate()).toBe(15);
        });

        test('令和元年5月1日を西暦に変換', () => {
            const date = fromJapaneseCalendar('令和', 1, 5, 1);
            expect(date).not.toBeNull();
            expect(date.getFullYear()).toBe(2019);
            expect(date.getMonth()).toBe(4); // 5月
            expect(date.getDate()).toBe(1);
        });

        test('平成31年4月30日を西暦に変換', () => {
            const date = fromJapaneseCalendar('平成', 31, 4, 30);
            expect(date).not.toBeNull();
            expect(date.getFullYear()).toBe(2019);
            expect(date.getMonth()).toBe(3); // 4月
            expect(date.getDate()).toBe(30);
        });

        test('昭和64年1月7日を西暦に変換', () => {
            const date = fromJapaneseCalendar('昭和', 64, 1, 7);
            expect(date).not.toBeNull();
            expect(date.getFullYear()).toBe(1989);
            expect(date.getMonth()).toBe(0); // 1月
            expect(date.getDate()).toBe(7);
        });

        test('不正な元号の場合nullを返す', () => {
            const date = fromJapaneseCalendar('存在しない元号', 1, 1, 1);
            expect(date).toBeNull();
        });

        test('不正な日付の場合nullを返す', () => {
            const date = fromJapaneseCalendar('令和', 5, 2, 30); // 2月30日
            expect(date).toBeNull();
        });

        test('元号開始日より前の日付の場合nullを返す', () => {
            // 令和元年4月1日（令和開始は5月1日）
            const date = fromJapaneseCalendar('令和', 1, 4, 1);
            expect(date).toBeNull();
        });
    });

    describe('和暦⇔西暦の相互変換', () => {
        test('西暦→和暦→西暦の変換で元の日付に戻る', () => {
            const originalDate = new Date(2023, 5, 15);
            const japanese = toJapaneseCalendar(originalDate);
            const convertedDate = fromJapaneseCalendar(
                japanese.era,
                japanese.year,
                japanese.month,
                japanese.day
            );
            expect(convertedDate.getTime()).toBe(originalDate.getTime());
        });

        test('和暦→西暦→和暦の変換で元の和暦に戻る', () => {
            const originalEra = '令和';
            const originalYear = 5;
            const originalMonth = 6;
            const originalDay = 15;
            
            const westernDate = fromJapaneseCalendar(originalEra, originalYear, originalMonth, originalDay);
            const japanese = toJapaneseCalendar(westernDate);
            
            expect(japanese.era).toBe(originalEra);
            expect(japanese.year).toBe(originalYear);
            expect(japanese.month).toBe(originalMonth);
            expect(japanese.day).toBe(originalDay);
        });
    });

    describe('getAvailableEras', () => {
        test('利用可能な元号のリストを取得', () => {
            const eras = getAvailableEras();
            expect(eras).toContain('令和');
            expect(eras).toContain('平成');
            expect(eras).toContain('昭和');
            expect(eras).toContain('大正');
            expect(eras).toContain('明治');
            expect(eras.length).toBeGreaterThanOrEqual(5);
        });
    });
});
