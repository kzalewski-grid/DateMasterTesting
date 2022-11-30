const unitTestingTask = require("./unitTestingTask");

describe("The language in unitTestingTask module", () => {
  test.each(["be", "cs", "kk", "pl", "ru", "tr", "tt", "uk"])(
    "can be changed by calling lang() method with one of the supported language's shortcut",
    (language) => {
      expect(unitTestingTask.lang(language)).toEqual(language);
    }
  );

  test.each(["de", "fr", "no"])(
    "will not be changed by calling lang() method with an unsupported language",
    (language) => {
      const currentLang = unitTestingTask.lang();
      expect(unitTestingTask.lang(language)).toEqual(currentLang);
    }
  );
});

describe("The unitTestingTask `register` method", () => {
  describe("allows to create a new formatter", () => {
    const newFormatter = unitTestingTask.register("longDate", "d MMMM");

    test("which can be found using `formatters` method", () => {
      expect(unitTestingTask.formatters()).toContain("longDate");
    });
  });
});

describe("The unitTestingTask function throws TypeError", () => {
  test("when called with no arguments", () => {
    expect(() => unitTestingTask()).toThrow(
      TypeError("Argument `format` must be a string")
    );
  });

  test.each([null, true, { format: "YYYY" }, ["YYYY"]])(
    "when `format` argument is not a string",
    (format) => {
      expect(() => unitTestingTask(format)).toThrow(
        TypeError("Argument `format` must be a string")
      );
    }
  );

  test.each([null, true, { date: "2022" }, [2022]])(
    "when type of `date` argument is incorrect",
    (date) => {
      expect(() => unitTestingTask("YYYY", date)).toThrow(
        TypeError(
          "Argument `date` must be instance of Date or Unix Timestamp or ISODate String"
        )
      );
    }
  );
});

describe("The unitTestingTask function returns a correct result", () => {
  describe("with language set to 'en'", () => {
    beforeAll(() => {
      unitTestingTask.lang("en");
    });

    describe("when called without a date argument", () => {
      beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2000-01-01T08:00:00Z").getTime());
      });

      afterAll(() => {
        jest.useRealTimers();
      });

      test.each([
        ["ISODate", "2000-01-01"],
        ["ISOTime", "08:00:00"],
        ["ISODateTime", "2000-01-01T08:00:00"],
        ["ISODateTimeTZ", "2000-01-01T08:00:00+00:00"],
      ])("and with one of predefined formatters", (format, result) => {
        expect(unitTestingTask(format)).toEqual(result);
      });

      test.each([
        ["DDD d MMMM YYYY HH:mm", "Saturday 1 January 2000 08:00"],
        ["D d-M hh:mm A", "Sa 1-1 08:00 AM"],
        ["DD dd MMM YY h:mm:ss.ff a Z", "Sat 01 Jan 00 8:00:00.000 am +00:00"],
        ["MM-YYYY H:m:s.f ZZ", "01-2000 8:0:0.0 +0000"],
      ])("and with a custom format string", (format, result) => {
        expect(unitTestingTask(format)).toEqual(result);
      });
    });

    describe("when called with a Date object as a date argument", () => {
      const date = new Date(2022, 11, 31, 23, 59, 59);
      test.each([
        ["ISODate", "2022-12-31"],
        ["ISOTime", "11:59:59"],
        ["ISODateTime", "2022-12-31T11:59:59"],
        ["ISODateTimeTZ", "2022-12-31T11:59:59+00:00"],
      ])("and with one of predefined formatters", (format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });

      test.each([
        ["DDD d MMMM YYYY HH:mm", "Saturday 31 December 2022 23:59"],
        ["D d-M hh:mm A", "Sa 31-12 11:59 PM"],
        ["DD dd MMM YY h:mm:ss.ff a Z", "Sat 31 Dec 22 11:59:59.000 pm +00:00"],
        ["MM-YYYY H:m:s.f ZZ", "12-2022 23:59:59.0 +0000"],
      ])("and with a custom format string", (format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });
    });

    describe("when called with a number as a date argument", () => {
      test.each([
        [0, "ISODate", "1970-01-01"],
        [1115256600000, "ISOTime", "01:30:00"],
        [-304800270000, "ISODateTime", "1960-05-05T05:15:30"],
        [5, "ISODateTimeTZ", "1970-01-01T12:00:00+00:00"],
      ])("and with one of predefined formatters", (date, format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });

      test.each([
        [0, "DDD d MMMM YYYY HH:mm", "Thursday 1 January 1970 00:00"],
        [1115256600000, "D d-M hh:mm A", "Th 5-5 01:30 AM"],
        [
          -304800270000,
          "DD dd MMM YY h:mm:ss.ff a Z",
          "Thu 05 May 60 5:15:30.000 am +00:00",
        ],
        [5, "MM-YYYY H:m:s.f ZZ", "01-1970 0:0:0.5 +0000"],
      ])("and with a custom format string", (date, format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });
    });

    describe("when called with a string as a date argument", () => {
      test.each([
        ["1960-05-05T05:15:30", "ISODate", "1960-05-05"],
        ["2022", "ISOTime", "12:00:00"],
        ["2000-12-12", "ISODateTime", "2000-12-12T12:00:00"],
        [
          "05 October 2011 14:48 UTC",
          "ISODateTimeTZ",
          "2011-10-05T02:48:00+00:00",
        ],
      ])("and with one of predefined formatters", (date, format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });

      test.each([
        [
          "1960-05-05T05:15:30",
          "DDD d MMMM YYYY HH:mm",
          "Thursday 5 May 1960 05:15",
        ],
        ["2022", "D d-M hh:mm A", "Sa 1-1 12:00 AM"],
        [
          "2000-12-12",
          "DD dd MMM YY h:mm:ss.ff a Z",
          "Tue 12 Dec 00 12:00:00.000 am +00:00",
        ],
        [
          "05 October 2011 14:48 UTC",
          "MM-YYYY H:m:s.f ZZ",
          "10-2011 14:48:0.0 +0000",
        ],
      ])("and with a custom format string", (date, format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });
    });
  });

  describe("with language set to 'pl'", () => {
    beforeAll(() => {
      unitTestingTask.lang("pl");
    });

    describe("when called without a date argument", () => {
      beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2000-01-01T08:00:00Z").getTime());
      });

      afterAll(() => {
        jest.useRealTimers();
      });

      test.each([
        ["DDD d MMMM YYYY HH:mm", "sobota 1 stycznia 2000 08:00"],
        ["D d-M hh:mm A", "So 1-1 08:00 rano"],
        ["DD dd MMM YY h:mm:ss.ff a Z", "sb 01 sty 00 8:00:00.000 rano +00:00"],
      ])("and with a custom format string", (format, result) => {
        expect(unitTestingTask(format)).toEqual(result);
      });
    });

    describe("when called with a Date object as a date argument", () => {
      const date = new Date(2022, 11, 31, 23, 59, 59);
      test.each([
        ["DDD d MMMM YYYY HH:mm", "sobota 31 grudnia 2022 23:59"],
        ["D d-M hh:mm A", "So 31-12 11:59"],
        ["DD dd MMM YY h:mm:ss.ff a Z", "sb 31 gru 22 11:59:59.000 +00:00"],
      ])("and with a custom format string", (format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });
    });

    describe("when called with a number as a date argument", () => {
      test.each([
        [0, "DDD d MMMM YYYY HH:mm", "czwartek 1 stycznia 1970 00:00"],
        [1115256600000, "D d-M hh:mm A", "Cz 5-5 01:30 rano"],
        [
          -304800270000,
          "DD dd MMM YY h:mm:ss.ff a Z",
          "czw 05 maj 60 5:15:30.000 rano +00:00",
        ],
        [5, "MMM 'YY", "sty '70"],
      ])("and with a custom format string", (date, format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });
    });

    describe("when called with a string as a date argument", () => {
      test.each([
        [
          "1960-05-05T05:15:30",
          "DDD d MMMM YYYY HH:mm",
          "czwartek 5 maja 1960 05:15",
        ],
        ["2022", "D d-M hh:mm A", "So 1-1 12:00 rano"],
        [
          "2000-12-12",
          "DD dd MMM YY h:mm:ss.ff a Z",
          "wt 12 gru 00 12:00:00.000 rano +00:00",
        ],
        ["2002-06", "MMMM YYYY", "czerwiec 2002"],
      ])("and with a custom format string", (date, format, result) => {
        expect(unitTestingTask(format, date)).toEqual(result);
      });
    });
  });
});
