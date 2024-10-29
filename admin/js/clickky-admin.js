;(function (window, $, undefined) { ;(function () {
    var VERSION = '2.2.3',
        pluginName = 'datepicker',
        autoInitSelector = '.datepicker-here',
        $body, $datepickersContainer,
        containerBuilt = false,
        baseTemplate = '' +
            '<div class="datepicker">' +
            '<i class="datepicker--pointer"></i>' +
            '<nav class="datepicker--nav"></nav>' +
            '<div class="datepicker--content"></div>' +
            '</div>',
        defaults = {
            classes: '',
            inline: false,
            language: 'ru',
            startDate: new Date(),
            firstDay: '',
            weekends: [6, 0],
            dateFormat: '',
            altField:'#datepicker',
            altFieldDateFormat:'yyyy-mm-dd',
            toggleSelected: true,
            keyboardNav: true,

            position: 'bottom left',
            offset: 12,

            view: 'days',
            minView: 'days',

            showOtherMonths: true,
            selectOtherMonths: true,
            moveToOtherMonthsOnSelect: true,

            showOtherYears: true,
            selectOtherYears: true,
            moveToOtherYearsOnSelect: true,

            minDate: '',
            maxDate: '',
            disableNavWhenOutOfRange: true,

            multipleDates: false, // Boolean or Number
            multipleDatesSeparator: ',',
            range: false,

            todayButton: false,
            clearButton: false,

            showEvent: 'focus',
            autoClose: false,

            // navigation
            monthsField: 'monthsShort',
            prevHtml: '<svg><path d="M 17,12 l -5,5 l 5,5"></path></svg>',
            nextHtml: '<svg><path d="M 14,12 l 5,5 l -5,5"></path></svg>',
            navTitles: {
                days: 'MM, <i>yyyy</i>',
                months: 'yyyy',
                years: 'yyyy1 - yyyy2'
            },

            // timepicker
            timepicker: false,
            onlyTimepicker: false,
            dateTimeSeparator: ' ',
            timeFormat: '',
            minHours: 0,
            maxHours: 24,
            minMinutes: 0,
            maxMinutes: 59,
            hoursStep: 1,
            minutesStep: 1,

            // events
            onSelect: '',
            onShow: '',
            onHide: '',
            onChangeMonth: '',
            onChangeYear: '',
            onChangeDecade: '',
            onChangeView: '',
            onRenderCell: ''
        },
        hotKeys = {
            'ctrlRight': [17, 39],
            'ctrlUp': [17, 38],
            'ctrlLeft': [17, 37],
            'ctrlDown': [17, 40],
            'shiftRight': [16, 39],
            'shiftUp': [16, 38],
            'shiftLeft': [16, 37],
            'shiftDown': [16, 40],
            'altUp': [18, 38],
            'altRight': [18, 39],
            'altLeft': [18, 37],
            'altDown': [18, 40],
            'ctrlShiftUp': [16, 17, 38]
        },
        datepicker;

    var Datepicker  = function (el, options) {
        this.el = el;
        this.$el = $(el);

        this.opts = $.extend(true, {}, defaults, options, this.$el.data());

        if ($body == undefined) {
            $body = $('body');
        }

        if (!this.opts.startDate) {
            this.opts.startDate = new Date();
        }

        if (this.el.nodeName == 'INPUT') {
            this.elIsInput = true;
        }


        if (this.opts.altField) {
            this.$altField = typeof this.opts.altField == 'string' ? $(this.opts.altField) : this.opts.altField;

        }

        this.inited = false;
        this.visible = false;
        this.silent = false; // Need to prevent unnecessary rendering

        this.currentDate = this.opts.startDate;
        this.currentView = this.opts.view;
        this._createShortCuts();
        this.selectedDates = [];
        this.views = {};
        this.keys = [];
        this.minRange = '';
        this.maxRange = '';
        this._prevOnSelectValue = '';

        this.init()
    };

    datepicker = Datepicker;

    datepicker.prototype = {
        VERSION: VERSION,
        viewIndexes: ['days', 'months', 'years'],

        init: function () {
            if (!containerBuilt && !this.opts.inline && this.elIsInput) {
                this._buildDatepickersContainer();
            }
            this._buildBaseHtml();
            this._defineLocale(this.opts.language);
            this._syncWithMinMaxDates();

            if (this.elIsInput) {
                if (!this.opts.inline) {
                    // Set extra classes for proper transitions
                    this._setPositionClasses(this.opts.position);
                    this._bindEvents()
                }
                if (this.opts.keyboardNav && !this.opts.onlyTimepicker) {
                    this._bindKeyboardEvents();
                }
                this.$datepicker.on('mousedown', this._onMouseDownDatepicker.bind(this));
                this.$datepicker.on('mouseup', this._onMouseUpDatepicker.bind(this));
            }

            if (this.opts.classes) {
                this.$datepicker.addClass(this.opts.classes)
            }

            if (this.opts.timepicker) {
                this.timepicker = new $.fn.datepicker.Timepicker(this, this.opts);
                this._bindTimepickerEvents();
            }

            if (this.opts.onlyTimepicker) {
                this.$datepicker.addClass('-only-timepicker-');
            }

            this.views[this.currentView] = new $.fn.datepicker.Body(this, this.currentView, this.opts);
            this.views[this.currentView].show();
            this.nav = new $.fn.datepicker.Navigation(this, this.opts);
            this.view = this.currentView;

            this.$el.on('clickCell.adp', this._onClickCell.bind(this));
            this.$datepicker.on('mouseenter', '.datepicker--cell', this._onMouseEnterCell.bind(this));
            this.$datepicker.on('mouseleave', '.datepicker--cell', this._onMouseLeaveCell.bind(this));

            this.inited = true;
        },

        _createShortCuts: function () {
            this.minDate = this.opts.minDate ? this.opts.minDate : new Date(-8639999913600000);
            this.maxDate = this.opts.maxDate ? this.opts.maxDate : new Date(8639999913600000);
        },

        _bindEvents : function () {
            this.$el.on(this.opts.showEvent + '.adp', this._onShowEvent.bind(this));
            this.$el.on('mouseup.adp', this._onMouseUpEl.bind(this));
            this.$el.on('blur.adp', this._onBlur.bind(this));
            this.$el.on('keyup.adp', this._onKeyUpGeneral.bind(this));
            $(window).on('resize.adp', this._onResize.bind(this));
            $('body').on('mouseup.adp', this._onMouseUpBody.bind(this));
        },

        _bindKeyboardEvents: function () {
            this.$el.on('keydown.adp', this._onKeyDown.bind(this));
            this.$el.on('keyup.adp', this._onKeyUp.bind(this));
            this.$el.on('hotKey.adp', this._onHotKey.bind(this));
        },

        _bindTimepickerEvents: function () {
            this.$el.on('timeChange.adp', this._onTimeChange.bind(this));
        },

        isWeekend: function (day) {
            return this.opts.weekends.indexOf(day) !== -1;
        },

        _defineLocale: function (lang) {
            if (typeof lang == 'string') {
                this.loc = $.fn.datepicker.language[lang];
                if (!this.loc) {
                    console.warn('Can\'t find language "' + lang + '" in Datepicker.language, will use "ru" instead');
                    this.loc = $.extend(true, {}, $.fn.datepicker.language.ru)
                }

                this.loc = $.extend(true, {}, $.fn.datepicker.language.ru, $.fn.datepicker.language[lang])
            } else {
                this.loc = $.extend(true, {}, $.fn.datepicker.language.ru, lang)
            }

            if (this.opts.dateFormat) {
                this.loc.dateFormat = this.opts.dateFormat
            }

            if (this.opts.timeFormat) {
                this.loc.timeFormat = this.opts.timeFormat
            }

            if (this.opts.firstDay !== '') {
                this.loc.firstDay = this.opts.firstDay
            }

            if (this.opts.timepicker) {
                this.loc.dateFormat = [this.loc.dateFormat, this.loc.timeFormat].join(this.opts.dateTimeSeparator);
            }

            if (this.opts.onlyTimepicker) {
                this.loc.dateFormat = this.loc.timeFormat;
            }

            var boundary = this._getWordBoundaryRegExp;
            if (this.loc.timeFormat.match(boundary('aa')) ||
                this.loc.timeFormat.match(boundary('AA'))
            ) {
                this.ampm = true;
            }
        },

        _buildDatepickersContainer: function () {
            containerBuilt = true;
            $body.append('<div class="datepickers-container" id="datepickers-container"></div>');
            $datepickersContainer = $('#datepickers-container');
        },

        _buildBaseHtml: function () {
            var $appendTarget,
                $inline = $('<div class="datepicker-inline">');

            if(this.el.nodeName == 'INPUT') {
                if (!this.opts.inline) {
                    $appendTarget = $datepickersContainer;
                } else {
                    $appendTarget = $inline.insertAfter(this.$el)
                }
            } else {
                $appendTarget = $inline.appendTo(this.$el)
            }

            this.$datepicker = $(baseTemplate).appendTo($appendTarget);
            this.$content = $('.datepicker--content', this.$datepicker);
            this.$nav = $('.datepicker--nav', this.$datepicker);
        },

        _triggerOnChange: function () {
            if (!this.selectedDates.length) {
                // Prevent from triggering multiple onSelect callback with same argument (empty string) in IE10-11
                if (this._prevOnSelectValue === '') return;
                this._prevOnSelectValue = '';
                return this.opts.onSelect('', '', this);
            }

            var selectedDates = this.selectedDates,
                parsedSelected = datepicker.getParsedDate(selectedDates[0]),
                formattedDates,
                _this = this,
                dates = new Date(
                    parsedSelected.year,
                    parsedSelected.month,
                    parsedSelected.date,
                    parsedSelected.hours,
                    parsedSelected.minutes
                );

            formattedDates = selectedDates.map(function (date) {
                return _this.formatDate(_this.loc.dateFormat, date)
            }).join(this.opts.multipleDatesSeparator);

            // Create new dates array, to separate it from original selectedDates
            if (this.opts.multipleDates || this.opts.range) {
                dates = selectedDates.map(function(date) {
                    var parsedDate = datepicker.getParsedDate(date);
                    return new Date(
                        parsedDate.year,
                        parsedDate.month,
                        parsedDate.date,
                        parsedDate.hours,
                        parsedDate.minutes
                    );
                })
            }

            this._prevOnSelectValue = formattedDates;
            this.opts.onSelect(formattedDates, dates, this);
        },

        next: function () {
            var d = this.parsedDate,
                o = this.opts;
            switch (this.view) {
                case 'days':
                    this.date = new Date(d.year, d.month + 1, 1);
                    if (o.onChangeMonth) o.onChangeMonth(this.parsedDate.month, this.parsedDate.year);
                    break;
                case 'months':
                    this.date = new Date(d.year + 1, d.month, 1);
                    if (o.onChangeYear) o.onChangeYear(this.parsedDate.year);
                    break;
                case 'years':
                    this.date = new Date(d.year + 10, 0, 1);
                    if (o.onChangeDecade) o.onChangeDecade(this.curDecade);
                    break;
            }
        },

        prev: function () {
            var d = this.parsedDate,
                o = this.opts;
            switch (this.view) {
                case 'days':
                    this.date = new Date(d.year, d.month - 1, 1);
                    if (o.onChangeMonth) o.onChangeMonth(this.parsedDate.month, this.parsedDate.year);
                    break;
                case 'months':
                    this.date = new Date(d.year - 1, d.month, 1);
                    if (o.onChangeYear) o.onChangeYear(this.parsedDate.year);
                    break;
                case 'years':
                    this.date = new Date(d.year - 10, 0, 1);
                    if (o.onChangeDecade) o.onChangeDecade(this.curDecade);
                    break;
            }
        },

        formatDate: function (string, date) {
            date = date || this.date;
            var result = string,
                boundary = this._getWordBoundaryRegExp,
                locale = this.loc,
                leadingZero = datepicker.getLeadingZeroNum,
                decade = datepicker.getDecade(date),
                d = datepicker.getParsedDate(date),
                fullHours = d.fullHours,
                hours = d.hours,
                ampm = string.match(boundary('aa')) || string.match(boundary('AA')),
                dayPeriod = 'am',
                replacer = this._replacer,
                validHours;

            if (this.opts.timepicker && this.timepicker && ampm) {
                validHours = this.timepicker._getValidHoursFromDate(date, ampm);
                fullHours = leadingZero(validHours.hours);
                hours = validHours.hours;
                dayPeriod = validHours.dayPeriod;
            }

            switch (true) {
                case /@/.test(result):
                    result = result.replace(/@/, date.getTime());
                case /aa/.test(result):
                    result = replacer(result, boundary('aa'), dayPeriod);
                case /AA/.test(result):
                    result = replacer(result, boundary('AA'), dayPeriod.toUpperCase());
                case /dd/.test(result):
                    result = replacer(result, boundary('dd'), d.fullDate);
                case /d/.test(result):
                    result = replacer(result, boundary('d'), d.date);
                case /DD/.test(result):
                    result = replacer(result, boundary('DD'), locale.days[d.day]);
                case /D/.test(result):
                    result = replacer(result, boundary('D'), locale.daysShort[d.day]);
                case /mm/.test(result):
                    result = replacer(result, boundary('mm'), d.fullMonth);
                case /m/.test(result):
                    result = replacer(result, boundary('m'), d.month + 1);
                case /MM/.test(result):
                    result = replacer(result, boundary('MM'), this.loc.months[d.month]);
                case /M/.test(result):
                    result = replacer(result, boundary('M'), locale.monthsShort[d.month]);
                case /ii/.test(result):
                    result = replacer(result, boundary('ii'), d.fullMinutes);
                case /i/.test(result):
                    result = replacer(result, boundary('i'), d.minutes);
                case /hh/.test(result):
                    result = replacer(result, boundary('hh'), fullHours);
                case /h/.test(result):
                    result = replacer(result, boundary('h'), hours);
                case /yyyy/.test(result):
                    result = replacer(result, boundary('yyyy'), d.year);
                case /yyyy1/.test(result):
                    result = replacer(result, boundary('yyyy1'), decade[0]);
                case /yyyy2/.test(result):
                    result = replacer(result, boundary('yyyy2'), decade[1]);
                case /yy/.test(result):
                    result = replacer(result, boundary('yy'), d.year.toString().slice(-2));
            }

            return result;
        },

        _replacer: function (str, reg, data) {
            return str.replace(reg, function (match, p1,p2,p3) {
                return p1 + data + p3;
            })
        },

        _getWordBoundaryRegExp: function (sign) {
            var symbols = '\\s|\\.|-|/|\\\\|,|\\$|\\!|\\?|:|;';

            return new RegExp('(^|>|' + symbols + ')(' + sign + ')($|<|' + symbols + ')', 'g');
        },


        selectDate: function (date) {
            var _this = this,
                opts = _this.opts,
                d = _this.parsedDate,
                selectedDates = _this.selectedDates,
                len = selectedDates.length,
                newDate = '';

            if (Array.isArray(date)) {
                date.forEach(function (d) {
                    _this.selectDate(d)
                });
                return;
            }

            if (!(date instanceof Date)) return;

            this.lastSelectedDate = date;

            // Set new time values from Date
            if (this.timepicker) {
                this.timepicker._setTime(date);
            }

            // On this step timepicker will set valid values in it's instance
            _this._trigger('selectDate', date);

            // Set correct time values after timepicker's validation
            // Prevent from setting hours or minutes which values are lesser then `min` value or
            // greater then `max` value
            if (this.timepicker) {
                date.setHours(this.timepicker.hours);
                date.setMinutes(this.timepicker.minutes)
            }

            if (_this.view == 'days') {
                if (date.getMonth() != d.month && opts.moveToOtherMonthsOnSelect) {
                    newDate = new Date(date.getFullYear(), date.getMonth(), 1);
                }
            }

            if (_this.view == 'years') {
                if (date.getFullYear() != d.year && opts.moveToOtherYearsOnSelect) {
                    newDate = new Date(date.getFullYear(), 0, 1);
                }
            }

            if (newDate) {
                _this.silent = true;
                _this.date = newDate;
                _this.silent = false;
                _this.nav._render()
            }

            if (opts.multipleDates && !opts.range) { // Set priority to range functionality
                if (len === opts.multipleDates) return;
                if (!_this._isSelected(date)) {
                    _this.selectedDates.push(date);
                }
            } else if (opts.range) {
                if (len == 2) {
                    _this.selectedDates = [date];
                    _this.minRange = date;
                    _this.maxRange = '';
                } else if (len == 1) {
                    _this.selectedDates.push(date);
                    if (!_this.maxRange){
                        _this.maxRange = date;
                    } else {
                        _this.minRange = date;
                    }
                    // Swap dates if they were selected via dp.selectDate() and second date was smaller then first
                    if (datepicker.bigger(_this.maxRange, _this.minRange)) {
                        _this.maxRange = _this.minRange;
                        _this.minRange = date;
                    }
                    _this.selectedDates = [_this.minRange, _this.maxRange]

                } else {
                    _this.selectedDates = [date];
                    _this.minRange = date;
                }
            } else {
                _this.selectedDates = [date];
            }

            _this._setInputValue();

            if (opts.onSelect) {
                _this._triggerOnChange();
            }

            if (opts.autoClose && !this.timepickerIsActive) {
                if (!opts.multipleDates && !opts.range) {
                    _this.hide();
                } else if (opts.range && _this.selectedDates.length == 2) {
                    _this.hide();
                }
            }

            _this.views[this.currentView]._render()
        },

        removeDate: function (date) {
            var selected = this.selectedDates,
                _this = this;

            if (!(date instanceof Date)) return;

            return selected.some(function (curDate, i) {
                if (datepicker.isSame(curDate, date)) {
                    selected.splice(i, 1);

                    if (!_this.selectedDates.length) {
                        _this.minRange = '';
                        _this.maxRange = '';
                        _this.lastSelectedDate = '';
                    } else {
                        _this.lastSelectedDate = _this.selectedDates[_this.selectedDates.length - 1];
                    }

                    _this.views[_this.currentView]._render();
                    _this._setInputValue();

                    if (_this.opts.onSelect) {
                        _this._triggerOnChange();
                    }

                    return true
                }
            })
        },

        today: function () {
            this.silent = true;
            this.view = this.opts.minView;
            this.silent = false;
            this.date = new Date();

            if (this.opts.todayButton instanceof Date) {
                this.selectDate(this.opts.todayButton)
            }
        },

        clear: function () {
            this.selectedDates = [];
            this.minRange = '';
            this.maxRange = '';
            this.views[this.currentView]._render();
            this._setInputValue();
            if (this.opts.onSelect) {
                this._triggerOnChange()
            }
        },

        /**
         * Updates datepicker options
         * @param {String|Object} param - parameter's name to update. If object then it will extend current options
         * @param {String|Number|Object} [value] - new param value
         */
        update: function (param, value) {
            var len = arguments.length,
                lastSelectedDate = this.lastSelectedDate;

            if (len == 2) {
                this.opts[param] = value;
            } else if (len == 1 && typeof param == 'object') {
                this.opts = $.extend(true, this.opts, param)
            }

            this._createShortCuts();
            this._syncWithMinMaxDates();
            this._defineLocale(this.opts.language);
            this.nav._addButtonsIfNeed();
            if (!this.opts.onlyTimepicker) this.nav._render();
            this.views[this.currentView]._render();

            if (this.elIsInput && !this.opts.inline) {
                this._setPositionClasses(this.opts.position);
                if (this.visible) {
                    this.setPosition(this.opts.position)
                }
            }

            if (this.opts.classes) {
                this.$datepicker.addClass(this.opts.classes)
            }

            if (this.opts.onlyTimepicker) {
                this.$datepicker.addClass('-only-timepicker-');
            }

            if (this.opts.timepicker) {
                if (lastSelectedDate) this.timepicker._handleDate(lastSelectedDate);
                this.timepicker._updateRanges();
                this.timepicker._updateCurrentTime();
                // Change hours and minutes if it's values have been changed through min/max hours/minutes
                if (lastSelectedDate) {
                    lastSelectedDate.setHours(this.timepicker.hours);
                    lastSelectedDate.setMinutes(this.timepicker.minutes);
                }
            }

            this._setInputValue();

            return this;
        },

        _syncWithMinMaxDates: function () {
            var curTime = this.date.getTime();
            this.silent = true;
            if (this.minTime > curTime) {
                this.date = this.minDate;
            }

            if (this.maxTime < curTime) {
                this.date = this.maxDate;
            }
            this.silent = false;
        },

        _isSelected: function (checkDate, cellType) {
            var res = false;
            this.selectedDates.some(function (date) {
                if (datepicker.isSame(date, checkDate, cellType)) {
                    res = date;
                    return true;
                }
            });
            return res;
        },

        _setInputValue: function () {
            var _this = this,
                opts = _this.opts,
                format = _this.loc.dateFormat,
                altFormat = opts.altFieldDateFormat,
                value = _this.selectedDates.map(function (date) {
                    return _this.formatDate(format, date)
                }),
                altValues;



            if (opts.altField && _this.$altField.length) {
                altValues = this.selectedDates.map(function (date) {
                    return _this.formatDate(altFormat, date)
                });
                altValues = altValues.join(this.opts.multipleDatesSeparator);
                this.$altField.val(altValues);
            }

            value = value.join(this.opts.multipleDatesSeparator);

            this.$el.val(value)
        },

        /**
         * Check if date is between minDate and maxDate
         * @param date {object} - date object
         * @param type {string} - cell type
         * @returns {boolean}
         * @private
         */
        _isInRange: function (date, type) {
            var time = date.getTime(),
                d = datepicker.getParsedDate(date),
                min = datepicker.getParsedDate(this.minDate),
                max = datepicker.getParsedDate(this.maxDate),
                dMinTime = new Date(d.year, d.month, min.date).getTime(),
                dMaxTime = new Date(d.year, d.month, max.date).getTime(),
                types = {
                    day: time >= this.minTime && time <= this.maxTime,
                    month: dMinTime >= this.minTime && dMaxTime <= this.maxTime,
                    year: d.year >= min.year && d.year <= max.year
                };
            return type ? types[type] : types.day
        },

        _getDimensions: function ($el) {
            var offset = $el.offset();

            return {
                width: $el.outerWidth(),
                height: $el.outerHeight(),
                left: offset.left,
                top: offset.top
            }
        },

        _getDateFromCell: function (cell) {
            var curDate = this.parsedDate,
                year = cell.data('year') || curDate.year,
                month = cell.data('month') == undefined ? curDate.month : cell.data('month'),
                date = cell.data('date') || 1;

            return new Date(year, month, date);
        },

        _setPositionClasses: function (pos) {
            pos = pos.split(' ');
            var main = pos[0],
                sec = pos[1],
                classes = 'datepicker -' + main + '-' + sec + '- -from-' + main + '-';

            if (this.visible) classes += ' active';

            this.$datepicker
                .removeAttr('class')
                .addClass(classes);
        },

        setPosition: function (position) {
            position = position || this.opts.position;

            var dims = this._getDimensions(this.$el),
                selfDims = this._getDimensions(this.$datepicker),
                pos = position.split(' '),
                top, left,
                offset = this.opts.offset,
                main = pos[0],
                secondary = pos[1];

            switch (main) {
                case 'top':
                    top = dims.top - selfDims.height - offset;
                    break;
                case 'right':
                    left = dims.left + dims.width + offset;
                    break;
                case 'bottom':
                    top = dims.top + dims.height + offset;
                    break;
                case 'left':
                    left = dims.left - selfDims.width - offset;
                    break;
            }

            switch(secondary) {
                case 'top':
                    top = dims.top;
                    break;
                case 'right':
                    left = dims.left + dims.width - selfDims.width;
                    break;
                case 'bottom':
                    top = dims.top + dims.height - selfDims.height;
                    break;
                case 'left':
                    left = dims.left;
                    break;
                case 'center':
                    if (/left|right/.test(main)) {
                        top = dims.top + dims.height/2 - selfDims.height/2;
                    } else {
                        left = dims.left + dims.width/2 - selfDims.width/2;
                    }
            }

            this.$datepicker
                .css({
                    left: left,
                    top: top
                })
        },

        show: function () {
            var onShow = this.opts.onShow;

            this.setPosition(this.opts.position);
            this.$datepicker.addClass('active');
            this.visible = true;

            if (onShow) {
                this._bindVisionEvents(onShow)
            }
        },

        hide: function () {
            var onHide = this.opts.onHide;

            this.$datepicker
                .removeClass('active')
                .css({
                    left: '-100000px'
                });

            this.focused = '';
            this.keys = [];

            this.inFocus = false;
            this.visible = false;
            this.$el.blur();

            if (onHide) {
                this._bindVisionEvents(onHide)
            }
        },

        down: function (date) {
            this._changeView(date, 'down');
        },

        up: function (date) {
            this._changeView(date, 'up');
        },

        _bindVisionEvents: function (event) {
            this.$datepicker.off('transitionend.dp');
            event(this, false);
            this.$datepicker.one('transitionend.dp', event.bind(this, this, true))
        },

        _changeView: function (date, dir) {
            date = date || this.focused || this.date;

            var nextView = dir == 'up' ? this.viewIndex + 1 : this.viewIndex - 1;
            if (nextView > 2) nextView = 2;
            if (nextView < 0) nextView = 0;

            this.silent = true;
            this.date = new Date(date.getFullYear(), date.getMonth(), 1);
            this.silent = false;
            this.view = this.viewIndexes[nextView];

        },

        _handleHotKey: function (key) {
            var date = datepicker.getParsedDate(this._getFocusedDate()),
                focusedParsed,
                o = this.opts,
                newDate,
                totalDaysInNextMonth,
                monthChanged = false,
                yearChanged = false,
                decadeChanged = false,
                y = date.year,
                m = date.month,
                d = date.date;

            switch (key) {
                case 'ctrlRight':
                case 'ctrlUp':
                    m += 1;
                    monthChanged = true;
                    break;
                case 'ctrlLeft':
                case 'ctrlDown':
                    m -= 1;
                    monthChanged = true;
                    break;
                case 'shiftRight':
                case 'shiftUp':
                    yearChanged = true;
                    y += 1;
                    break;
                case 'shiftLeft':
                case 'shiftDown':
                    yearChanged = true;
                    y -= 1;
                    break;
                case 'altRight':
                case 'altUp':
                    decadeChanged = true;
                    y += 10;
                    break;
                case 'altLeft':
                case 'altDown':
                    decadeChanged = true;
                    y -= 10;
                    break;
                case 'ctrlShiftUp':
                    this.up();
                    break;
            }

            totalDaysInNextMonth = datepicker.getDaysCount(new Date(y,m));
            newDate = new Date(y,m,d);

            // If next month has less days than current, set date to total days in that month
            if (totalDaysInNextMonth < d) d = totalDaysInNextMonth;

            // Check if newDate is in valid range
            if (newDate.getTime() < this.minTime) {
                newDate = this.minDate;
            } else if (newDate.getTime() > this.maxTime) {
                newDate = this.maxDate;
            }

            this.focused = newDate;

            focusedParsed = datepicker.getParsedDate(newDate);
            if (monthChanged && o.onChangeMonth) {
                o.onChangeMonth(focusedParsed.month, focusedParsed.year)
            }
            if (yearChanged && o.onChangeYear) {
                o.onChangeYear(focusedParsed.year)
            }
            if (decadeChanged && o.onChangeDecade) {
                o.onChangeDecade(this.curDecade)
            }
        },

        _registerKey: function (key) {
            var exists = this.keys.some(function (curKey) {
                return curKey == key;
            });

            if (!exists) {
                this.keys.push(key)
            }
        },

        _unRegisterKey: function (key) {
            var index = this.keys.indexOf(key);

            this.keys.splice(index, 1);
        },

        _isHotKeyPressed: function () {
            var currentHotKey,
                found = false,
                _this = this,
                pressedKeys = this.keys.sort();

            for (var hotKey in hotKeys) {
                currentHotKey = hotKeys[hotKey];
                if (pressedKeys.length != currentHotKey.length) continue;

                if (currentHotKey.every(function (key, i) { return key == pressedKeys[i]})) {
                    _this._trigger('hotKey', hotKey);
                    found = true;
                }
            }

            return found;
        },

        _trigger: function (event, args) {
            this.$el.trigger(event, args)
        },

        _focusNextCell: function (keyCode, type) {
            type = type || this.cellType;

            var date = datepicker.getParsedDate(this._getFocusedDate()),
                y = date.year,
                m = date.month,
                d = date.date;

            if (this._isHotKeyPressed()){
                return;
            }

            switch(keyCode) {
                case 37: // left
                    type == 'day' ? (d -= 1) : '';
                    type == 'month' ? (m -= 1) : '';
                    type == 'year' ? (y -= 1) : '';
                    break;
                case 38: // up
                    type == 'day' ? (d -= 7) : '';
                    type == 'month' ? (m -= 3) : '';
                    type == 'year' ? (y -= 4) : '';
                    break;
                case 39: // right
                    type == 'day' ? (d += 1) : '';
                    type == 'month' ? (m += 1) : '';
                    type == 'year' ? (y += 1) : '';
                    break;
                case 40: // down
                    type == 'day' ? (d += 7) : '';
                    type == 'month' ? (m += 3) : '';
                    type == 'year' ? (y += 4) : '';
                    break;
            }

            var nd = new Date(y,m,d);
            if (nd.getTime() < this.minTime) {
                nd = this.minDate;
            } else if (nd.getTime() > this.maxTime) {
                nd = this.maxDate;
            }

            this.focused = nd;

        },

        _getFocusedDate: function () {
            var focused  = this.focused || this.selectedDates[this.selectedDates.length - 1],
                d = this.parsedDate;

            if (!focused) {
                switch (this.view) {
                    case 'days':
                        focused = new Date(d.year, d.month, new Date().getDate());
                        break;
                    case 'months':
                        focused = new Date(d.year, d.month, 1);
                        break;
                    case 'years':
                        focused = new Date(d.year, 0, 1);
                        break;
                }
            }

            return focused;
        },

        _getCell: function (date, type) {
            type = type || this.cellType;

            var d = datepicker.getParsedDate(date),
                selector = '.datepicker--cell[data-year="' + d.year + '"]',
                $cell;

            switch (type) {
                case 'month':
                    selector = '[data-month="' + d.month + '"]';
                    break;
                case 'day':
                    selector += '[data-month="' + d.month + '"][data-date="' + d.date + '"]';
                    break;
            }
            $cell = this.views[this.currentView].$el.find(selector);

            return $cell.length ? $cell : $('');
        },

        destroy: function () {
            var _this = this;
            _this.$el
                .off('.adp')
                .data('datepicker', '');

            _this.selectedDates = [];
            _this.focused = '';
            _this.views = {};
            _this.keys = [];
            _this.minRange = '';
            _this.maxRange = '';

            if (_this.opts.inline || !_this.elIsInput) {
                _this.$datepicker.closest('.datepicker-inline').remove();
            } else {
                _this.$datepicker.remove();
            }
        },

        _handleAlreadySelectedDates: function (alreadySelected, selectedDate) {
            if (this.opts.range) {
                if (!this.opts.toggleSelected) {
                    // Add possibility to select same date when range is true
                    if (this.selectedDates.length != 2) {
                        this._trigger('clickCell', selectedDate);
                    }
                } else {
                    this.removeDate(selectedDate);
                }
            } else if (this.opts.toggleSelected){
                this.removeDate(selectedDate);
            }

            // Change last selected date to be able to change time when clicking on this cell
            if (!this.opts.toggleSelected) {
                this.lastSelectedDate = alreadySelected;
                if (this.opts.timepicker) {
                    this.timepicker._setTime(alreadySelected);
                    this.timepicker.update();
                }
            }
        },

        _onShowEvent: function (e) {
            if (!this.visible) {
                this.show();
            }
        },

        _onBlur: function () {
            if (!this.inFocus && this.visible) {
                this.hide();
            }
        },

        _onMouseDownDatepicker: function (e) {
            this.inFocus = true;
        },

        _onMouseUpDatepicker: function (e) {
            this.inFocus = false;
            e.originalEvent.inFocus = true;
            if (!e.originalEvent.timepickerFocus) this.$el.focus();
        },

        _onKeyUpGeneral: function (e) {
            var val = this.$el.val();

            if (!val) {
                this.clear();
            }
        },

        _onResize: function () {
            if (this.visible) {
                this.setPosition();
            }
        },

        _onMouseUpBody: function (e) {
            if (e.originalEvent.inFocus) return;

            if (this.visible && !this.inFocus) {
                this.hide();
            }
        },

        _onMouseUpEl: function (e) {
            e.originalEvent.inFocus = true;
            setTimeout(this._onKeyUpGeneral.bind(this),4);
        },

        _onKeyDown: function (e) {
            var code = e.which;
            this._registerKey(code);

            // Arrows
            if (code >= 37 && code <= 40) {
                e.preventDefault();
                this._focusNextCell(code);
            }

            // Enter
            if (code == 13) {
                if (this.focused) {
                    if (this._getCell(this.focused).hasClass('-disabled-')) return;
                    if (this.view != this.opts.minView) {
                        this.down()
                    } else {
                        var alreadySelected = this._isSelected(this.focused, this.cellType);

                        if (!alreadySelected) {
                            if (this.timepicker) {
                                this.focused.setHours(this.timepicker.hours);
                                this.focused.setMinutes(this.timepicker.minutes);
                            }
                            this.selectDate(this.focused);
                            return;
                        }
                        this._handleAlreadySelectedDates(alreadySelected, this.focused)
                    }
                }
            }

            // Esc
            if (code == 27) {
                this.hide();
            }
        },

        _onKeyUp: function (e) {
            var code = e.which;
            this._unRegisterKey(code);
        },

        _onHotKey: function (e, hotKey) {
            this._handleHotKey(hotKey);
        },

        _onMouseEnterCell: function (e) {
            var $cell = $(e.target).closest('.datepicker--cell'),
                date = this._getDateFromCell($cell);

            // Prevent from unnecessary rendering and setting new currentDate
            this.silent = true;

            if (this.focused) {
                this.focused = ''
            }

            $cell.addClass('-focus-');

            this.focused = date;
            this.silent = false;

            if (this.opts.range && this.selectedDates.length == 1) {
                this.minRange = this.selectedDates[0];
                this.maxRange = '';
                if (datepicker.less(this.minRange, this.focused)) {
                    this.maxRange = this.minRange;
                    this.minRange = '';
                }
                this.views[this.currentView]._update();
            }
        },

        _onMouseLeaveCell: function (e) {
            var $cell = $(e.target).closest('.datepicker--cell');

            $cell.removeClass('-focus-');

            this.silent = true;
            this.focused = '';
            this.silent = false;
        },

        _onTimeChange: function (e, h, m) {
            var date = new Date(),
                selectedDates = this.selectedDates,
                selected = false;

            if (selectedDates.length) {
                selected = true;
                date = this.lastSelectedDate;
            }

            date.setHours(h);
            date.setMinutes(m);

            if (!selected && !this._getCell(date).hasClass('-disabled-')) {
                this.selectDate(date);
            } else {
                this._setInputValue();
                if (this.opts.onSelect) {
                    this._triggerOnChange();
                }
            }
        },

        _onClickCell: function (e, date) {
            if (this.timepicker) {
                date.setHours(this.timepicker.hours);
                date.setMinutes(this.timepicker.minutes);
            }
            this.selectDate(date);
        },

        set focused(val) {
            if (!val && this.focused) {
                var $cell = this._getCell(this.focused);

                if ($cell.length) {
                    $cell.removeClass('-focus-')
                }
            }
            this._focused = val;
            if (this.opts.range && this.selectedDates.length == 1) {
                this.minRange = this.selectedDates[0];
                this.maxRange = '';
                if (datepicker.less(this.minRange, this._focused)) {
                    this.maxRange = this.minRange;
                    this.minRange = '';
                }
            }
            if (this.silent) return;
            this.date = val;
        },

        get focused() {
            return this._focused;
        },

        get parsedDate() {
            return datepicker.getParsedDate(this.date);
        },

        set date (val) {
            if (!(val instanceof Date)) return;

            this.currentDate = val;

            if (this.inited && !this.silent) {
                this.views[this.view]._render();
                this.nav._render();
                if (this.visible && this.elIsInput) {
                    this.setPosition();
                }
            }
            return val;
        },

        get date () {
            return this.currentDate
        },

        set view (val) {
            this.viewIndex = this.viewIndexes.indexOf(val);

            if (this.viewIndex < 0) {
                return;
            }

            this.prevView = this.currentView;
            this.currentView = val;

            if (this.inited) {
                if (!this.views[val]) {
                    this.views[val] = new  $.fn.datepicker.Body(this, val, this.opts)
                } else {
                    this.views[val]._render();
                }

                this.views[this.prevView].hide();
                this.views[val].show();
                this.nav._render();

                if (this.opts.onChangeView) {
                    this.opts.onChangeView(val)
                }
                if (this.elIsInput && this.visible) this.setPosition();
            }

            return val
        },

        get view() {
            return this.currentView;
        },

        get cellType() {
            return this.view.substring(0, this.view.length - 1)
        },

        get minTime() {
            var min = datepicker.getParsedDate(this.minDate);
            return new Date(min.year, min.month, min.date).getTime()
        },

        get maxTime() {
            var max = datepicker.getParsedDate(this.maxDate);
            return new Date(max.year, max.month, max.date).getTime()
        },

        get curDecade() {
            return datepicker.getDecade(this.date)
        }
    };

    //  Utils
    // -------------------------------------------------

    datepicker.getDaysCount = function (date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    datepicker.getParsedDate = function (date) {
        return {
            year: date.getFullYear(),
            month: date.getMonth(),
            fullMonth: (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1, // One based
            date: date.getDate(),
            fullDate: date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
            day: date.getDay(),
            hours: date.getHours(),
            fullHours:  date.getHours() < 10 ? '0' + date.getHours() :  date.getHours() ,
            minutes: date.getMinutes(),
            fullMinutes:  date.getMinutes() < 10 ? '0' + date.getMinutes() :  date.getMinutes()
        }
    };

    datepicker.getDecade = function (date) {
        var firstYear = Math.floor(date.getFullYear() / 10) * 10;

        return [firstYear, firstYear + 9];
    };

    datepicker.template = function (str, data) {
        return str.replace(/#\{([\w]+)\}/g, function (source, match) {
            if (data[match] || data[match] === 0) {
                return data[match]
            }
        });
    };

    datepicker.isSame = function (date1, date2, type) {
        if (!date1 || !date2) return false;
        var d1 = datepicker.getParsedDate(date1),
            d2 = datepicker.getParsedDate(date2),
            _type = type ? type : 'day',

            conditions = {
                day: d1.date == d2.date && d1.month == d2.month && d1.year == d2.year,
                month: d1.month == d2.month && d1.year == d2.year,
                year: d1.year == d2.year
            };

        return conditions[_type];
    };

    datepicker.less = function (dateCompareTo, date, type) {
        if (!dateCompareTo || !date) return false;
        return date.getTime() < dateCompareTo.getTime();
    };

    datepicker.bigger = function (dateCompareTo, date, type) {
        if (!dateCompareTo || !date) return false;
        return date.getTime() > dateCompareTo.getTime();
    };

    datepicker.getLeadingZeroNum = function (num) {
        return parseInt(num) < 10 ? '0' + num : num;
    };

    /**
     * Returns copy of date with hours and minutes equals to 0
     * @param date {Date}
     */
    datepicker.resetTime = function (date) {
        if (typeof date != 'object') return;
        date = datepicker.getParsedDate(date);
        return new Date(date.year, date.month, date.date)
    };

    $.fn.datepicker = function ( options ) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this,  pluginName,
                    new Datepicker( this, options ));
            } else {
                var _this = $.data(this, pluginName);

                _this.opts = $.extend(true, _this.opts, options);
                _this.update();
            }
        });
    };

    $.fn.datepicker.Constructor = Datepicker;

    $.fn.datepicker.language = {
        ru: {
            days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            daysShort: ['Вос','Пон','Вто','Сре','Чет','Пят','Суб'],
            daysMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            today: 'Сегодня',
            clear: 'Очистить',
            dateFormat: 'dd.mm.yyyy',
            timeFormat: 'hh:ii',
            firstDay: 1
        }
    };

    $(function () {
        $(autoInitSelector).datepicker();
    })

})();

    ;(function () {
        var templates = {
                days:'' +
                '<div class="datepicker--days datepicker--body">' +
                '<div class="datepicker--days-names"></div>' +
                '<div class="datepicker--cells datepicker--cells-days"></div>' +
                '</div>',
                months: '' +
                '<div class="datepicker--months datepicker--body">' +
                '<div class="datepicker--cells datepicker--cells-months"></div>' +
                '</div>',
                years: '' +
                '<div class="datepicker--years datepicker--body">' +
                '<div class="datepicker--cells datepicker--cells-years"></div>' +
                '</div>'
            },
            datepicker = $.fn.datepicker,
            dp = datepicker.Constructor;

        datepicker.Body = function (d, type, opts) {
            this.d = d;
            this.type = type;
            this.opts = opts;
            this.$el = $('');

            if (this.opts.onlyTimepicker) return;
            this.init();
        };

        datepicker.Body.prototype = {
            init: function () {
                this._buildBaseHtml();
                this._render();

                this._bindEvents();
            },

            _bindEvents: function () {
                this.$el.on('click', '.datepicker--cell', $.proxy(this._onClickCell, this));
            },

            _buildBaseHtml: function () {
                this.$el = $(templates[this.type]).appendTo(this.d.$content);
                this.$names = $('.datepicker--days-names', this.$el);
                this.$cells = $('.datepicker--cells', this.$el);
            },

            _getDayNamesHtml: function (firstDay, curDay, html, i) {
                curDay = curDay != undefined ? curDay : firstDay;
                html = html ? html : '';
                i = i != undefined ? i : 0;

                if (i > 7) return html;
                if (curDay == 7) return this._getDayNamesHtml(firstDay, 0, html, ++i);

                html += '<div class="datepicker--day-name' + (this.d.isWeekend(curDay) ? " -weekend-" : "") + '">' + this.d.loc.daysMin[curDay] + '</div>';

                return this._getDayNamesHtml(firstDay, ++curDay, html, ++i);
            },

            _getCellContents: function (date, type) {
                var classes = "datepicker--cell datepicker--cell-" + type,
                    currentDate = new Date(),
                    parent = this.d,
                    minRange = dp.resetTime(parent.minRange),
                    maxRange = dp.resetTime(parent.maxRange),
                    opts = parent.opts,
                    d = dp.getParsedDate(date),
                    render = {},
                    html = d.date;

                switch (type) {
                    case 'day':
                        if (parent.isWeekend(d.day)) classes += " -weekend-";
                        if (d.month != this.d.parsedDate.month) {
                            classes += " -other-month-";
                            if (!opts.selectOtherMonths) {
                                classes += " -disabled-";
                            }
                            if (!opts.showOtherMonths) html = '';
                        }
                        break;
                    case 'month':
                        html = parent.loc[parent.opts.monthsField][d.month];
                        break;
                    case 'year':
                        var decade = parent.curDecade;
                        html = d.year;
                        if (d.year < decade[0] || d.year > decade[1]) {
                            classes += ' -other-decade-';
                            if (!opts.selectOtherYears) {
                                classes += " -disabled-";
                            }
                            if (!opts.showOtherYears) html = '';
                        }
                        break;
                }

                if (opts.onRenderCell) {
                    render = opts.onRenderCell(date, type) || {};
                    html = render.html ? render.html : html;
                    classes += render.classes ? ' ' + render.classes : '';
                }

                if (opts.range) {
                    if (dp.isSame(minRange, date, type)) classes += ' -range-from-';
                    if (dp.isSame(maxRange, date, type)) classes += ' -range-to-';

                    if (parent.selectedDates.length == 1 && parent.focused) {
                        if (
                            (dp.bigger(minRange, date) && dp.less(parent.focused, date)) ||
                            (dp.less(maxRange, date) && dp.bigger(parent.focused, date)))
                        {
                            classes += ' -in-range-'
                        }

                        if (dp.less(maxRange, date) && dp.isSame(parent.focused, date)) {
                            classes += ' -range-from-'
                        }
                        if (dp.bigger(minRange, date) && dp.isSame(parent.focused, date)) {
                            classes += ' -range-to-'
                        }

                    } else if (parent.selectedDates.length == 2) {
                        if (dp.bigger(minRange, date) && dp.less(maxRange, date)) {
                            classes += ' -in-range-'
                        }
                    }
                }


                if (dp.isSame(currentDate, date, type)) classes += ' -current-';
                if (parent.focused && dp.isSame(date, parent.focused, type)) classes += ' -focus-';
                if (parent._isSelected(date, type)) classes += ' -selected-';
                if (!parent._isInRange(date, type) || render.disabled) classes += ' -disabled-';

                return {
                    html: html,
                    classes: classes
                }
            },

            /**
             * Calculates days number to render. Generates days html and returns it.
             * @param {object} date - Date object
             * @returns {string}
             * @private
             */
            _getDaysHtml: function (date) {
                var totalMonthDays = dp.getDaysCount(date),
                    firstMonthDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
                    lastMonthDay = new Date(date.getFullYear(), date.getMonth(), totalMonthDays).getDay(),
                    daysFromPevMonth = firstMonthDay - this.d.loc.firstDay,
                    daysFromNextMonth = 6 - lastMonthDay + this.d.loc.firstDay;

                daysFromPevMonth = daysFromPevMonth < 0 ? daysFromPevMonth + 7 : daysFromPevMonth;
                daysFromNextMonth = daysFromNextMonth > 6 ? daysFromNextMonth - 7 : daysFromNextMonth;

                var startDayIndex = -daysFromPevMonth + 1,
                    m, y,
                    html = '';

                for (var i = startDayIndex, max = totalMonthDays + daysFromNextMonth; i <= max; i++) {
                    y = date.getFullYear();
                    m = date.getMonth();

                    html += this._getDayHtml(new Date(y, m, i))
                }

                return html;
            },

            _getDayHtml: function (date) {
                var content = this._getCellContents(date, 'day');

                return '<div class="' + content.classes + '" ' +
                    'data-date="' + date.getDate() + '" ' +
                    'data-month="' + date.getMonth() + '" ' +
                    'data-year="' + date.getFullYear() + '">' + content.html + '</div>';
            },

            /**
             * Generates months html
             * @param {object} date - date instance
             * @returns {string}
             * @private
             */
            _getMonthsHtml: function (date) {
                var html = '',
                    d = dp.getParsedDate(date),
                    i = 0;

                while(i < 12) {
                    html += this._getMonthHtml(new Date(d.year, i));
                    i++
                }

                return html;
            },

            _getMonthHtml: function (date) {
                var content = this._getCellContents(date, 'month');

                return '<div class="' + content.classes + '" data-month="' + date.getMonth() + '">' + content.html + '</div>'
            },

            _getYearsHtml: function (date) {
                var d = dp.getParsedDate(date),
                    decade = dp.getDecade(date),
                    firstYear = decade[0] - 1,
                    html = '',
                    i = firstYear;

                for (i; i <= decade[1] + 1; i++) {
                    html += this._getYearHtml(new Date(i , 0));
                }

                return html;
            },

            _getYearHtml: function (date) {
                var content = this._getCellContents(date, 'year');

                return '<div class="' + content.classes + '" data-year="' + date.getFullYear() + '">' + content.html + '</div>'
            },

            _renderTypes: {
                days: function () {
                    var dayNames = this._getDayNamesHtml(this.d.loc.firstDay),
                        days = this._getDaysHtml(this.d.currentDate);

                    this.$cells.html(days);
                    this.$names.html(dayNames)
                },
                months: function () {
                    var html = this._getMonthsHtml(this.d.currentDate);

                    this.$cells.html(html)
                },
                years: function () {
                    var html = this._getYearsHtml(this.d.currentDate);

                    this.$cells.html(html)
                }
            },

            _render: function () {
                if (this.opts.onlyTimepicker) return;
                this._renderTypes[this.type].bind(this)();
            },

            _update: function () {
                var $cells = $('.datepicker--cell', this.$cells),
                    _this = this,
                    classes,
                    $cell,
                    date;
                $cells.each(function (cell, i) {
                    $cell = $(this);
                    date = _this.d._getDateFromCell($(this));
                    classes = _this._getCellContents(date, _this.d.cellType);
                    $cell.attr('class',classes.classes)
                });
            },

            show: function () {
                if (this.opts.onlyTimepicker) return;
                this.$el.addClass('active');
                this.acitve = true;
            },

            hide: function () {
                this.$el.removeClass('active');
                this.active = false;
            },

            //  Events
            // -------------------------------------------------

            _handleClick: function (el) {
                var date = el.data('date') || 1,
                    month = el.data('month') || 0,
                    year = el.data('year') || this.d.parsedDate.year,
                    dp = this.d;
                // Change view if min view does not reach yet
                if (dp.view != this.opts.minView) {
                    dp.down(new Date(year, month, date));
                    return;
                }
                // Select date if min view is reached
                var selectedDate = new Date(year, month, date),
                    alreadySelected = this.d._isSelected(selectedDate, this.d.cellType);

                if (!alreadySelected) {
                    dp._trigger('clickCell', selectedDate);
                    return;
                }

                dp._handleAlreadySelectedDates.bind(dp, alreadySelected, selectedDate)();

            },

            _onClickCell: function (e) {
                var $el = $(e.target).closest('.datepicker--cell');

                if ($el.hasClass('-disabled-')) return;

                this._handleClick.bind(this)($el);
            }
        };
    })();

    ;(function () {
        var template = '' +
                '<div class="datepicker--nav-action" data-action="prev">#{prevHtml}</div>' +
                '<div class="datepicker--nav-title">#{title}</div>' +
                '<div class="datepicker--nav-action" data-action="next">#{nextHtml}</div>',
            buttonsContainerTemplate = '<div class="datepicker--buttons"></div>',
            button = '<span class="datepicker--button" data-action="#{action}">#{label}</span>',
            datepicker = $.fn.datepicker,
            dp = datepicker.Constructor;

        datepicker.Navigation = function (d, opts) {
            this.d = d;
            this.opts = opts;

            this.$buttonsContainer = '';

            this.init();
        };

        datepicker.Navigation.prototype = {
            init: function () {
                this._buildBaseHtml();
                this._bindEvents();
            },

            _bindEvents: function () {
                this.d.$nav.on('click', '.datepicker--nav-action', $.proxy(this._onClickNavButton, this));
                this.d.$nav.on('click', '.datepicker--nav-title', $.proxy(this._onClickNavTitle, this));
                this.d.$datepicker.on('click', '.datepicker--button', $.proxy(this._onClickNavButton, this));
            },

            _buildBaseHtml: function () {
                if (!this.opts.onlyTimepicker) {
                    this._render();
                }
                this._addButtonsIfNeed();
            },

            _addButtonsIfNeed: function () {
                if (this.opts.todayButton) {
                    this._addButton('today')
                }
                if (this.opts.clearButton) {
                    this._addButton('clear')
                }
            },

            _render: function () {
                var title = this._getTitle(this.d.currentDate),
                    html = dp.template(template, $.extend({title: title}, this.opts));
                this.d.$nav.html(html);
                if (this.d.view == 'years') {
                    $('.datepicker--nav-title', this.d.$nav).addClass('-disabled-');
                }
                this.setNavStatus();
            },

            _getTitle: function (date) {
                return this.d.formatDate(this.opts.navTitles[this.d.view], date)
            },

            _addButton: function (type) {
                if (!this.$buttonsContainer.length) {
                    this._addButtonsContainer();
                }

                var data = {
                        action: type,
                        label: this.d.loc[type]
                    },
                    html = dp.template(button, data);

                if ($('[data-action=' + type + ']', this.$buttonsContainer).length) return;
                this.$buttonsContainer.append(html);
            },

            _addButtonsContainer: function () {
                this.d.$datepicker.append(buttonsContainerTemplate);
                this.$buttonsContainer = $('.datepicker--buttons', this.d.$datepicker);
            },

            setNavStatus: function () {
                if (!(this.opts.minDate || this.opts.maxDate) || !this.opts.disableNavWhenOutOfRange) return;

                var date = this.d.parsedDate,
                    m = date.month,
                    y = date.year,
                    d = date.date;

                switch (this.d.view) {
                    case 'days':
                        if (!this.d._isInRange(new Date(y, m-1, 1), 'month')) {
                            this._disableNav('prev')
                        }
                        if (!this.d._isInRange(new Date(y, m+1, 1), 'month')) {
                            this._disableNav('next')
                        }
                        break;
                    case 'months':
                        if (!this.d._isInRange(new Date(y-1, m, d), 'year')) {
                            this._disableNav('prev')
                        }
                        if (!this.d._isInRange(new Date(y+1, m, d), 'year')) {
                            this._disableNav('next')
                        }
                        break;
                    case 'years':
                        var decade = dp.getDecade(this.d.date);
                        if (!this.d._isInRange(new Date(decade[0] - 1, 0, 1), 'year')) {
                            this._disableNav('prev')
                        }
                        if (!this.d._isInRange(new Date(decade[1] + 1, 0, 1), 'year')) {
                            this._disableNav('next')
                        }
                        break;
                }
            },

            _disableNav: function (nav) {
                $('[data-action="' + nav + '"]', this.d.$nav).addClass('-disabled-')
            },

            _activateNav: function (nav) {
                $('[data-action="' + nav + '"]', this.d.$nav).removeClass('-disabled-')
            },

            _onClickNavButton: function (e) {
                var $el = $(e.target).closest('[data-action]'),
                    action = $el.data('action');

                this.d[action]();
            },

            _onClickNavTitle: function (e) {
                if ($(e.target).hasClass('-disabled-')) return;

                if (this.d.view == 'days') {
                    return this.d.view = 'months'
                }

                this.d.view = 'years';
            }
        }

    })();

    ;(function () {
        var template = '<div class="datepicker--time">' +
                '<div class="datepicker--time-current">' +
                '   <span class="datepicker--time-current-hours">#{hourVisible}</span>' +
                '   <span class="datepicker--time-current-colon">:</span>' +
                '   <span class="datepicker--time-current-minutes">#{minValue}</span>' +
                '</div>' +
                '<div class="datepicker--time-sliders">' +
                '   <div class="datepicker--time-row">' +
                '      <input type="range" name="hours" value="#{hourValue}" min="#{hourMin}" max="#{hourMax}" step="#{hourStep}"/>' +
                '   </div>' +
                '   <div class="datepicker--time-row">' +
                '      <input type="range" name="minutes" value="#{minValue}" min="#{minMin}" max="#{minMax}" step="#{minStep}"/>' +
                '   </div>' +
                '</div>' +
                '</div>',
            datepicker = $.fn.datepicker,
            dp = datepicker.Constructor;

        datepicker.Timepicker = function (inst, opts) {
            this.d = inst;
            this.opts = opts;

            this.init();
        };

        datepicker.Timepicker.prototype = {
            init: function () {
                var input = 'input';
                this._setTime(this.d.date);
                this._buildHTML();

                if (navigator.userAgent.match(/trident/gi)) {
                    input = 'change';
                }

                this.d.$el.on('selectDate', this._onSelectDate.bind(this));
                this.$ranges.on(input, this._onChangeRange.bind(this));
                this.$ranges.on('mouseup', this._onMouseUpRange.bind(this));
                this.$ranges.on('mousemove focus ', this._onMouseEnterRange.bind(this));
                this.$ranges.on('mouseout blur', this._onMouseOutRange.bind(this));
            },

            _setTime: function (date) {
                var _date = dp.getParsedDate(date);

                this._handleDate(date);
                this.hours = _date.hours < this.minHours ? this.minHours : _date.hours;
                this.minutes = _date.minutes < this.minMinutes ? this.minMinutes : _date.minutes;
            },

            /**
             * Sets minHours and minMinutes from date (usually it's a minDate)
             * Also changes minMinutes if current hours are bigger then @date hours
             * @param date {Date}
             * @private
             */
            _setMinTimeFromDate: function (date) {
                this.minHours = date.getHours();
                this.minMinutes = date.getMinutes();

                // If, for example, min hours are 10, and current hours are 12,
                // update minMinutes to default value, to be able to choose whole range of values
                if (this.d.lastSelectedDate) {
                    if (this.d.lastSelectedDate.getHours() > date.getHours()) {
                        this.minMinutes = this.opts.minMinutes;
                    }
                }
            },

            _setMaxTimeFromDate: function (date) {
                this.maxHours = date.getHours();
                this.maxMinutes = date.getMinutes();

                if (this.d.lastSelectedDate) {
                    if (this.d.lastSelectedDate.getHours() < date.getHours()) {
                        this.maxMinutes = this.opts.maxMinutes;
                    }
                }
            },

            _setDefaultMinMaxTime: function () {
                var maxHours = 23,
                    maxMinutes = 59,
                    opts = this.opts;

                this.minHours = opts.minHours < 0 || opts.minHours > maxHours ? 0 : opts.minHours;
                this.minMinutes = opts.minMinutes < 0 || opts.minMinutes > maxMinutes ? 0 : opts.minMinutes;
                this.maxHours = opts.maxHours < 0 || opts.maxHours > maxHours ? maxHours : opts.maxHours;
                this.maxMinutes = opts.maxMinutes < 0 || opts.maxMinutes > maxMinutes ? maxMinutes : opts.maxMinutes;
            },

            /**
             * Looks for min/max hours/minutes and if current values
             * are out of range sets valid values.
             * @private
             */
            _validateHoursMinutes: function (date) {
                if (this.hours < this.minHours) {
                    this.hours = this.minHours;
                } else if (this.hours > this.maxHours) {
                    this.hours = this.maxHours;
                }

                if (this.minutes < this.minMinutes) {
                    this.minutes = this.minMinutes;
                } else if (this.minutes > this.maxMinutes) {
                    this.minutes = this.maxMinutes;
                }
            },

            _buildHTML: function () {
                var lz = dp.getLeadingZeroNum,
                    data = {
                        hourMin: this.minHours,
                        hourMax: lz(this.maxHours),
                        hourStep: this.opts.hoursStep,
                        hourValue: this.hours,
                        hourVisible: lz(this.displayHours),
                        minMin: this.minMinutes,
                        minMax: lz(this.maxMinutes),
                        minStep: this.opts.minutesStep,
                        minValue: lz(this.minutes)
                    },
                    _template = dp.template(template, data);

                this.$timepicker = $(_template).appendTo(this.d.$datepicker);
                this.$ranges = $('[type="range"]', this.$timepicker);
                this.$hours = $('[name="hours"]', this.$timepicker);
                this.$minutes = $('[name="minutes"]', this.$timepicker);
                this.$hoursText = $('.datepicker--time-current-hours', this.$timepicker);
                this.$minutesText = $('.datepicker--time-current-minutes', this.$timepicker);

                if (this.d.ampm) {
                    this.$ampm = $('<span class="datepicker--time-current-ampm">')
                        .appendTo($('.datepicker--time-current', this.$timepicker))
                        .html(this.dayPeriod);

                    this.$timepicker.addClass('-am-pm-');
                }
            },

            _updateCurrentTime: function () {
                var h =  dp.getLeadingZeroNum(this.displayHours),
                    m = dp.getLeadingZeroNum(this.minutes);

                this.$hoursText.html(h);
                this.$minutesText.html(m);

                if (this.d.ampm) {
                    this.$ampm.html(this.dayPeriod);
                }
            },

            _updateRanges: function () {
                this.$hours.attr({
                    min: this.minHours,
                    max: this.maxHours
                }).val(this.hours);

                this.$minutes.attr({
                    min: this.minMinutes,
                    max: this.maxMinutes
                }).val(this.minutes)
            },

            /**
             * Sets minHours, minMinutes etc. from date. If date is not passed, than sets
             * values from options
             * @param [date] {object} - Date object, to get values from
             * @private
             */
            _handleDate: function (date) {
                this._setDefaultMinMaxTime();
                if (date) {
                    if (dp.isSame(date, this.d.opts.minDate)) {
                        this._setMinTimeFromDate(this.d.opts.minDate);
                    } else if (dp.isSame(date, this.d.opts.maxDate)) {
                        this._setMaxTimeFromDate(this.d.opts.maxDate);
                    }
                }

                this._validateHoursMinutes(date);
            },

            update: function () {
                this._updateRanges();
                this._updateCurrentTime();
            },

            /**
             * Calculates valid hour value to display in text input and datepicker's body.
             * @param date {Date|Number} - date or hours
             * @param [ampm] {Boolean} - 12 hours mode
             * @returns {{hours: *, dayPeriod: string}}
             * @private
             */
            _getValidHoursFromDate: function (date, ampm) {
                var d = date,
                    hours = date;

                if (date instanceof Date) {
                    d = dp.getParsedDate(date);
                    hours = d.hours;
                }

                var _ampm = ampm || this.d.ampm,
                    dayPeriod = 'am';

                if (_ampm) {
                    switch(true) {
                        case hours == 0:
                            hours = 12;
                            break;
                        case hours == 12:
                            dayPeriod = 'pm';
                            break;
                        case hours > 11:
                            hours = hours - 12;
                            dayPeriod = 'pm';
                            break;
                        default:
                            break;
                    }
                }

                return {
                    hours: hours,
                    dayPeriod: dayPeriod
                }
            },

            set hours (val) {
                this._hours = val;

                var displayHours = this._getValidHoursFromDate(val);

                this.displayHours = displayHours.hours;
                this.dayPeriod = displayHours.dayPeriod;
            },

            get hours() {
                return this._hours;
            },

            //  Events
            // -------------------------------------------------

            _onChangeRange: function (e) {
                var $target = $(e.target),
                    name = $target.attr('name');

                this.d.timepickerIsActive = true;

                this[name] = $target.val();
                this._updateCurrentTime();
                this.d._trigger('timeChange', [this.hours, this.minutes]);

                this._handleDate(this.d.lastSelectedDate);
                this.update()
            },

            _onSelectDate: function (e, data) {
                this._handleDate(data);
                this.update();
            },

            _onMouseEnterRange: function (e) {
                var name = $(e.target).attr('name');
                $('.datepicker--time-current-' + name, this.$timepicker).addClass('-focus-');
            },

            _onMouseOutRange: function (e) {
                var name = $(e.target).attr('name');
                if (this.d.inFocus) return; // Prevent removing focus when mouse out of range slider
                $('.datepicker--time-current-' + name, this.$timepicker).removeClass('-focus-');
            },

            _onMouseUpRange: function (e) {
                this.d.timepickerIsActive = false;
            }
        };
    })();
})(window, jQuery);


/*!
 * Materialize v0.97.7 (http://materializecss.com)
 * Copyright 2014-2015 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 */
if ("undefined" == typeof jQuery) {
    var jQuery;
    jQuery = "function" == typeof require ? $ = require("jquery") : $
}
jQuery.easing.jswing = jQuery.easing.swing, jQuery.extend(jQuery.easing, {
    def: "easeOutQuad",
    swing: function (a, b, c, d, e) {
        return jQuery.easing[jQuery.easing.def](a, b, c, d, e)
    },
    easeInQuad: function (a, b, c, d, e) {
        return d * (b /= e) * b + c
    },
    easeOutQuad: function (a, b, c, d, e) {
        return -d * (b /= e) * (b - 2) + c
    },
    easeInOutQuad: function (a, b, c, d, e) {
        return (b /= e / 2) < 1 ? d / 2 * b * b + c : -d / 2 * (--b * (b - 2) - 1) + c
    },
    easeInCubic: function (a, b, c, d, e) {
        return d * (b /= e) * b * b + c
    },
    easeOutCubic: function (a, b, c, d, e) {
        return d * ((b = b / e - 1) * b * b + 1) + c
    },
    easeInOutCubic: function (a, b, c, d, e) {
        return (b /= e / 2) < 1 ? d / 2 * b * b * b + c : d / 2 * ((b -= 2) * b * b + 2) + c
    },
    easeInQuart: function (a, b, c, d, e) {
        return d * (b /= e) * b * b * b + c
    },
    easeOutQuart: function (a, b, c, d, e) {
        return -d * ((b = b / e - 1) * b * b * b - 1) + c
    },
    easeInOutQuart: function (a, b, c, d, e) {
        return (b /= e / 2) < 1 ? d / 2 * b * b * b * b + c : -d / 2 * ((b -= 2) * b * b * b - 2) + c
    },
    easeInQuint: function (a, b, c, d, e) {
        return d * (b /= e) * b * b * b * b + c
    },
    easeOutQuint: function (a, b, c, d, e) {
        return d * ((b = b / e - 1) * b * b * b * b + 1) + c
    },
    easeInOutQuint: function (a, b, c, d, e) {
        return (b /= e / 2) < 1 ? d / 2 * b * b * b * b * b + c : d / 2 * ((b -= 2) * b * b * b * b + 2) + c
    },
    easeInSine: function (a, b, c, d, e) {
        return -d * Math.cos(b / e * (Math.PI / 2)) + d + c
    },
    easeOutSine: function (a, b, c, d, e) {
        return d * Math.sin(b / e * (Math.PI / 2)) + c
    },
    easeInOutSine: function (a, b, c, d, e) {
        return -d / 2 * (Math.cos(Math.PI * b / e) - 1) + c
    },
    easeInExpo: function (a, b, c, d, e) {
        return 0 == b ? c : d * Math.pow(2, 10 * (b / e - 1)) + c
    },
    easeOutExpo: function (a, b, c, d, e) {
        return b == e ? c + d : d * (-Math.pow(2, -10 * b / e) + 1) + c
    },
    easeInOutExpo: function (a, b, c, d, e) {
        return 0 == b ? c : b == e ? c + d : (b /= e / 2) < 1 ? d / 2 * Math.pow(2, 10 * (b - 1)) + c : d / 2 * (-Math.pow(2, -10 * --b) + 2) + c
    },
    easeInCirc: function (a, b, c, d, e) {
        return -d * (Math.sqrt(1 - (b /= e) * b) - 1) + c
    },
    easeOutCirc: function (a, b, c, d, e) {
        return d * Math.sqrt(1 - (b = b / e - 1) * b) + c
    },
    easeInOutCirc: function (a, b, c, d, e) {
        return (b /= e / 2) < 1 ? -d / 2 * (Math.sqrt(1 - b * b) - 1) + c : d / 2 * (Math.sqrt(1 - (b -= 2) * b) + 1) + c
    },
    easeInElastic: function (a, b, c, d, e) {
        var f = 1.70158, g = 0, h = d;
        if (0 == b)return c;
        if (1 == (b /= e))return c + d;
        if (g || (g = .3 * e), h < Math.abs(d)) {
            h = d;
            var f = g / 4
        } else var f = g / (2 * Math.PI) * Math.asin(d / h);
        return -(h * Math.pow(2, 10 * (b -= 1)) * Math.sin((b * e - f) * (2 * Math.PI) / g)) + c
    },
    easeOutElastic: function (a, b, c, d, e) {
        var f = 1.70158, g = 0, h = d;
        if (0 == b)return c;
        if (1 == (b /= e))return c + d;
        if (g || (g = .3 * e), h < Math.abs(d)) {
            h = d;
            var f = g / 4
        } else var f = g / (2 * Math.PI) * Math.asin(d / h);
        return h * Math.pow(2, -10 * b) * Math.sin((b * e - f) * (2 * Math.PI) / g) + d + c
    },
    easeInOutElastic: function (a, b, c, d, e) {
        var f = 1.70158, g = 0, h = d;
        if (0 == b)return c;
        if (2 == (b /= e / 2))return c + d;
        if (g || (g = e * (.3 * 1.5)), h < Math.abs(d)) {
            h = d;
            var f = g / 4
        } else var f = g / (2 * Math.PI) * Math.asin(d / h);
        return 1 > b ? -.5 * (h * Math.pow(2, 10 * (b -= 1)) * Math.sin((b * e - f) * (2 * Math.PI) / g)) + c : h * Math.pow(2, -10 * (b -= 1)) * Math.sin((b * e - f) * (2 * Math.PI) / g) * .5 + d + c
    },
    easeInBack: function (a, b, c, d, e, f) {
        return void 0 == f && (f = 1.70158), d * (b /= e) * b * ((f + 1) * b - f) + c
    },
    easeOutBack: function (a, b, c, d, e, f) {
        return void 0 == f && (f = 1.70158), d * ((b = b / e - 1) * b * ((f + 1) * b + f) + 1) + c
    },
    easeInOutBack: function (a, b, c, d, e, f) {
        return void 0 == f && (f = 1.70158), (b /= e / 2) < 1 ? d / 2 * (b * b * (((f *= 1.525) + 1) * b - f)) + c : d / 2 * ((b -= 2) * b * (((f *= 1.525) + 1) * b + f) + 2) + c
    },
    easeInBounce: function (a, b, c, d, e) {
        return d - jQuery.easing.easeOutBounce(a, e - b, 0, d, e) + c
    },
    easeOutBounce: function (a, b, c, d, e) {
        return (b /= e) < 1 / 2.75 ? d * (7.5625 * b * b) + c : 2 / 2.75 > b ? d * (7.5625 * (b -= 1.5 / 2.75) * b + .75) + c : 2.5 / 2.75 > b ? d * (7.5625 * (b -= 2.25 / 2.75) * b + .9375) + c : d * (7.5625 * (b -= 2.625 / 2.75) * b + .984375) + c
    },
    easeInOutBounce: function (a, b, c, d, e) {
        return e / 2 > b ? .5 * jQuery.easing.easeInBounce(a, 2 * b, 0, d, e) + c : .5 * jQuery.easing.easeOutBounce(a, 2 * b - e, 0, d, e) + .5 * d + c
    }
}), jQuery.extend(jQuery.easing, {
    easeInOutMaterial: function (a, b, c, d, e) {
        return (b /= e / 2) < 1 ? d / 2 * b * b + c : d / 4 * ((b -= 2) * b * b + 2) + c
    }
}), jQuery.Velocity ? console.log("Velocity is already loaded. You may be needlessly importing Velocity again; note that Materialize includes Velocity.") : (!function (a) {
    function b(a) {
        var b = a.length, d = c.type(a);
        return "function" === d || c.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === d || 0 === b || "number" == typeof b && b > 0 && b - 1 in a
    }

    if (!a.jQuery) {
        var c = function (a, b) {
            return new c.fn.init(a, b)
        };
        c.isWindow = function (a) {
            return null != a && a == a.window
        }, c.type = function (a) {
            return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? e[g.call(a)] || "object" : typeof a
        }, c.isArray = Array.isArray || function (a) {
                return "array" === c.type(a)
            }, c.isPlainObject = function (a) {
            var b;
            if (!a || "object" !== c.type(a) || a.nodeType || c.isWindow(a))return !1;
            try {
                if (a.constructor && !f.call(a, "constructor") && !f.call(a.constructor.prototype, "isPrototypeOf"))return !1
            } catch (d) {
                return !1
            }
            for (b in a);
            return void 0 === b || f.call(a, b)
        }, c.each = function (a, c, d) {
            var e, f = 0, g = a.length, h = b(a);
            if (d) {
                if (h)for (; g > f && (e = c.apply(a[f], d), e !== !1); f++); else for (f in a)if (e = c.apply(a[f], d), e === !1)break
            } else if (h)for (; g > f && (e = c.call(a[f], f, a[f]), e !== !1); f++); else for (f in a)if (e = c.call(a[f], f, a[f]), e === !1)break;
            return a
        }, c.data = function (a, b, e) {
            if (void 0 === e) {
                var f = a[c.expando], g = f && d[f];
                if (void 0 === b)return g;
                if (g && b in g)return g[b]
            } else if (void 0 !== b) {
                var f = a[c.expando] || (a[c.expando] = ++c.uuid);
                return d[f] = d[f] || {}, d[f][b] = e, e
            }
        }, c.removeData = function (a, b) {
            var e = a[c.expando], f = e && d[e];
            f && c.each(b, function (a, b) {
                delete f[b]
            })
        }, c.extend = function () {
            var a, b, d, e, f, g, h = arguments[0] || {}, i = 1, j = arguments.length, k = !1;
            for ("boolean" == typeof h && (k = h, h = arguments[i] || {}, i++), "object" != typeof h && "function" !== c.type(h) && (h = {}), i === j && (h = this, i--); j > i; i++)if (null != (f = arguments[i]))for (e in f)a = h[e], d = f[e], h !== d && (k && d && (c.isPlainObject(d) || (b = c.isArray(d))) ? (b ? (b = !1, g = a && c.isArray(a) ? a : []) : g = a && c.isPlainObject(a) ? a : {}, h[e] = c.extend(k, g, d)) : void 0 !== d && (h[e] = d));
            return h
        }, c.queue = function (a, d, e) {
            function f(a, c) {
                var d = c || [];
                return null != a && (b(Object(a)) ? !function (a, b) {
                    for (var c = +b.length, d = 0, e = a.length; c > d;)a[e++] = b[d++];
                    if (c !== c)for (; void 0 !== b[d];)a[e++] = b[d++];
                    return a.length = e, a
                }(d, "string" == typeof a ? [a] : a) : [].push.call(d, a)), d
            }

            if (a) {
                d = (d || "fx") + "queue";
                var g = c.data(a, d);
                return e ? (!g || c.isArray(e) ? g = c.data(a, d, f(e)) : g.push(e), g) : g || []
            }
        }, c.dequeue = function (a, b) {
            c.each(a.nodeType ? [a] : a, function (a, d) {
                b = b || "fx";
                var e = c.queue(d, b), f = e.shift();
                "inprogress" === f && (f = e.shift()), f && ("fx" === b && e.unshift("inprogress"), f.call(d, function () {
                    c.dequeue(d, b)
                }))
            })
        }, c.fn = c.prototype = {
            init: function (a) {
                if (a.nodeType)return this[0] = a, this;
                throw new Error("Not a DOM node.")
            }, offset: function () {
                var b = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : {top: 0, left: 0};
                return {
                    top: b.top + (a.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0),
                    left: b.left + (a.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
                }
            }, position: function () {
                function a() {
                    for (var a = this.offsetParent || document; a && "html" === !a.nodeType.toLowerCase && "static" === a.style.position;)a = a.offsetParent;
                    return a || document
                }

                var b = this[0], a = a.apply(b), d = this.offset(), e = /^(?:body|html)$/i.test(a.nodeName) ? {
                    top: 0,
                    left: 0
                } : c(a).offset();
                return d.top -= parseFloat(b.style.marginTop) || 0, d.left -= parseFloat(b.style.marginLeft) || 0, a.style && (e.top += parseFloat(a.style.borderTopWidth) || 0, e.left += parseFloat(a.style.borderLeftWidth) || 0), {
                    top: d.top - e.top,
                    left: d.left - e.left
                }
            }
        };
        var d = {};
        c.expando = "velocity" + (new Date).getTime(), c.uuid = 0;
        for (var e = {}, f = e.hasOwnProperty, g = e.toString, h = "Boolean Number String Function Array Date RegExp Object Error".split(" "), i = 0; i < h.length; i++)e["[object " + h[i] + "]"] = h[i].toLowerCase();
        c.fn.init.prototype = c.fn, a.Velocity = {Utilities: c}
    }
}(window), function (a) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = a() : "function" == typeof define && define.amd ? define(a) : a()
}(function () {
    return function (a, b, c, d) {
        function e(a) {
            for (var b = -1, c = a ? a.length : 0, d = []; ++b < c;) {
                var e = a[b];
                e && d.push(e)
            }
            return d
        }

        function f(a) {
            return p.isWrapped(a) ? a = [].slice.call(a) : p.isNode(a) && (a = [a]), a
        }

        function g(a) {
            var b = m.data(a, "velocity");
            return null === b ? d : b
        }

        function h(a) {
            return function (b) {
                return Math.round(b * a) * (1 / a)
            }
        }

        function i(a, c, d, e) {
            function f(a, b) {
                return 1 - 3 * b + 3 * a
            }

            function g(a, b) {
                return 3 * b - 6 * a
            }

            function h(a) {
                return 3 * a
            }

            function i(a, b, c) {
                return ((f(b, c) * a + g(b, c)) * a + h(b)) * a
            }

            function j(a, b, c) {
                return 3 * f(b, c) * a * a + 2 * g(b, c) * a + h(b)
            }

            function k(b, c) {
                for (var e = 0; p > e; ++e) {
                    var f = j(c, a, d);
                    if (0 === f)return c;
                    var g = i(c, a, d) - b;
                    c -= g / f
                }
                return c
            }

            function l() {
                for (var b = 0; t > b; ++b)x[b] = i(b * u, a, d)
            }

            function m(b, c, e) {
                var f, g, h = 0;
                do g = c + (e - c) / 2, f = i(g, a, d) - b, f > 0 ? e = g : c = g; while (Math.abs(f) > r && ++h < s);
                return g
            }

            function n(b) {
                for (var c = 0, e = 1, f = t - 1; e != f && x[e] <= b; ++e)c += u;
                --e;
                var g = (b - x[e]) / (x[e + 1] - x[e]), h = c + g * u, i = j(h, a, d);
                return i >= q ? k(b, h) : 0 == i ? h : m(b, c, c + u)
            }

            function o() {
                y = !0, (a != c || d != e) && l()
            }

            var p = 4, q = .001, r = 1e-7, s = 10, t = 11, u = 1 / (t - 1), v = "Float32Array" in b;
            if (4 !== arguments.length)return !1;
            for (var w = 0; 4 > w; ++w)if ("number" != typeof arguments[w] || isNaN(arguments[w]) || !isFinite(arguments[w]))return !1;
            a = Math.min(a, 1), d = Math.min(d, 1), a = Math.max(a, 0), d = Math.max(d, 0);
            var x = v ? new Float32Array(t) : new Array(t), y = !1, z = function (b) {
                return y || o(), a === c && d === e ? b : 0 === b ? 0 : 1 === b ? 1 : i(n(b), c, e)
            };
            z.getControlPoints = function () {
                return [{x: a, y: c}, {x: d, y: e}]
            };
            var A = "generateBezier(" + [a, c, d, e] + ")";
            return z.toString = function () {
                return A
            }, z
        }

        function j(a, b) {
            var c = a;
            return p.isString(a) ? t.Easings[a] || (c = !1) : c = p.isArray(a) && 1 === a.length ? h.apply(null, a) : p.isArray(a) && 2 === a.length ? u.apply(null, a.concat([b])) : p.isArray(a) && 4 === a.length ? i.apply(null, a) : !1, c === !1 && (c = t.Easings[t.defaults.easing] ? t.defaults.easing : s), c
        }

        function k(a) {
            if (a) {
                var b = (new Date).getTime(), c = t.State.calls.length;
                c > 1e4 && (t.State.calls = e(t.State.calls));
                for (var f = 0; c > f; f++)if (t.State.calls[f]) {
                    var h = t.State.calls[f], i = h[0], j = h[2], n = h[3], o = !!n, q = null;
                    n || (n = t.State.calls[f][3] = b - 16);
                    for (var r = Math.min((b - n) / j.duration, 1), s = 0, u = i.length; u > s; s++) {
                        var w = i[s], y = w.element;
                        if (g(y)) {
                            var z = !1;
                            if (j.display !== d && null !== j.display && "none" !== j.display) {
                                if ("flex" === j.display) {
                                    var A = ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex"];
                                    m.each(A, function (a, b) {
                                        v.setPropertyValue(y, "display", b)
                                    })
                                }
                                v.setPropertyValue(y, "display", j.display)
                            }
                            j.visibility !== d && "hidden" !== j.visibility && v.setPropertyValue(y, "visibility", j.visibility);
                            for (var B in w)if ("element" !== B) {
                                var C, D = w[B], E = p.isString(D.easing) ? t.Easings[D.easing] : D.easing;
                                if (1 === r)C = D.endValue; else {
                                    var F = D.endValue - D.startValue;
                                    if (C = D.startValue + F * E(r, j, F), !o && C === D.currentValue)continue
                                }
                                if (D.currentValue = C, "tween" === B)q = C; else {
                                    if (v.Hooks.registered[B]) {
                                        var G = v.Hooks.getRoot(B), H = g(y).rootPropertyValueCache[G];
                                        H && (D.rootPropertyValue = H)
                                    }
                                    var I = v.setPropertyValue(y, B, D.currentValue + (0 === parseFloat(C) ? "" : D.unitType), D.rootPropertyValue, D.scrollData);
                                    v.Hooks.registered[B] && (g(y).rootPropertyValueCache[G] = v.Normalizations.registered[G] ? v.Normalizations.registered[G]("extract", null, I[1]) : I[1]), "transform" === I[0] && (z = !0)
                                }
                            }
                            j.mobileHA && g(y).transformCache.translate3d === d && (g(y).transformCache.translate3d = "(0px, 0px, 0px)", z = !0), z && v.flushTransformCache(y)
                        }
                    }
                    j.display !== d && "none" !== j.display && (t.State.calls[f][2].display = !1), j.visibility !== d && "hidden" !== j.visibility && (t.State.calls[f][2].visibility = !1), j.progress && j.progress.call(h[1], h[1], r, Math.max(0, n + j.duration - b), n, q), 1 === r && l(f)
                }
            }
            t.State.isTicking && x(k)
        }

        function l(a, b) {
            if (!t.State.calls[a])return !1;
            for (var c = t.State.calls[a][0], e = t.State.calls[a][1], f = t.State.calls[a][2], h = t.State.calls[a][4], i = !1, j = 0, k = c.length; k > j; j++) {
                var l = c[j].element;
                if (b || f.loop || ("none" === f.display && v.setPropertyValue(l, "display", f.display), "hidden" === f.visibility && v.setPropertyValue(l, "visibility", f.visibility)), f.loop !== !0 && (m.queue(l)[1] === d || !/\.velocityQueueEntryFlag/i.test(m.queue(l)[1])) && g(l)) {
                    g(l).isAnimating = !1, g(l).rootPropertyValueCache = {};
                    var n = !1;
                    m.each(v.Lists.transforms3D, function (a, b) {
                        var c = /^scale/.test(b) ? 1 : 0, e = g(l).transformCache[b];
                        g(l).transformCache[b] !== d && new RegExp("^\\(" + c + "[^.]").test(e) && (n = !0, delete g(l).transformCache[b])
                    }), f.mobileHA && (n = !0, delete g(l).transformCache.translate3d), n && v.flushTransformCache(l), v.Values.removeClass(l, "velocity-animating")
                }
                if (!b && f.complete && !f.loop && j === k - 1)try {
                    f.complete.call(e, e)
                } catch (o) {
                    setTimeout(function () {
                        throw o
                    }, 1)
                }
                h && f.loop !== !0 && h(e), g(l) && f.loop === !0 && !b && (m.each(g(l).tweensContainer, function (a, b) {
                    /^rotate/.test(a) && 360 === parseFloat(b.endValue) && (b.endValue = 0, b.startValue = 360), /^backgroundPosition/.test(a) && 100 === parseFloat(b.endValue) && "%" === b.unitType && (b.endValue = 0, b.startValue = 100)
                }), t(l, "reverse", {loop: !0, delay: f.delay})), f.queue !== !1 && m.dequeue(l, f.queue)
            }
            t.State.calls[a] = !1;
            for (var p = 0, q = t.State.calls.length; q > p; p++)if (t.State.calls[p] !== !1) {
                i = !0;
                break
            }
            i === !1 && (t.State.isTicking = !1, delete t.State.calls, t.State.calls = [])
        }

        var m, n = function () {
            if (c.documentMode)return c.documentMode;
            for (var a = 7; a > 4; a--) {
                var b = c.createElement("div");
                if (b.innerHTML = "<!--[if IE " + a + "]><span></span><![endif]-->", b.getElementsByTagName("span").length)return b = null, a
            }
            return d
        }(), o = function () {
            var a = 0;
            return b.webkitRequestAnimationFrame || b.mozRequestAnimationFrame || function (b) {
                    var c, d = (new Date).getTime();
                    return c = Math.max(0, 16 - (d - a)), a = d + c, setTimeout(function () {
                        b(d + c)
                    }, c)
                }
        }(), p = {
            isString: function (a) {
                return "string" == typeof a
            }, isArray: Array.isArray || function (a) {
                return "[object Array]" === Object.prototype.toString.call(a)
            }, isFunction: function (a) {
                return "[object Function]" === Object.prototype.toString.call(a)
            }, isNode: function (a) {
                return a && a.nodeType
            }, isNodeList: function (a) {
                return "object" == typeof a && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(a)) && a.length !== d && (0 === a.length || "object" == typeof a[0] && a[0].nodeType > 0)
            }, isWrapped: function (a) {
                return a && (a.jquery || b.Zepto && b.Zepto.zepto.isZ(a))
            }, isSVG: function (a) {
                return b.SVGElement && a instanceof b.SVGElement
            }, isEmptyObject: function (a) {
                for (var b in a)return !1;
                return !0
            }
        }, q = !1;
        if (a.fn && a.fn.jquery ? (m = a, q = !0) : m = b.Velocity.Utilities, 8 >= n && !q)throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
        if (7 >= n)return void(jQuery.fn.velocity = jQuery.fn.animate);
        var r = 400, s = "swing", t = {
            State: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                isAndroid: /Android/i.test(navigator.userAgent),
                isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
                isChrome: b.chrome,
                isFirefox: /Firefox/i.test(navigator.userAgent),
                prefixElement: c.createElement("div"),
                prefixMatches: {},
                scrollAnchor: null,
                scrollPropertyLeft: null,
                scrollPropertyTop: null,
                isTicking: !1,
                calls: []
            },
            CSS: {},
            Utilities: m,
            Redirects: {},
            Easings: {},
            Promise: b.Promise,
            defaults: {
                queue: "",
                duration: r,
                easing: s,
                begin: d,
                complete: d,
                progress: d,
                display: d,
                visibility: d,
                loop: !1,
                delay: !1,
                mobileHA: !0,
                _cacheValues: !0
            },
            init: function (a) {
                m.data(a, "velocity", {
                    isSVG: p.isSVG(a),
                    isAnimating: !1,
                    computedStyle: null,
                    tweensContainer: null,
                    rootPropertyValueCache: {},
                    transformCache: {}
                })
            },
            hook: null,
            mock: !1,
            version: {major: 1, minor: 2, patch: 2},
            debug: !1
        };
        b.pageYOffset !== d ? (t.State.scrollAnchor = b, t.State.scrollPropertyLeft = "pageXOffset", t.State.scrollPropertyTop = "pageYOffset") : (t.State.scrollAnchor = c.documentElement || c.body.parentNode || c.body, t.State.scrollPropertyLeft = "scrollLeft", t.State.scrollPropertyTop = "scrollTop");
        var u = function () {
            function a(a) {
                return -a.tension * a.x - a.friction * a.v
            }

            function b(b, c, d) {
                var e = {x: b.x + d.dx * c, v: b.v + d.dv * c, tension: b.tension, friction: b.friction};
                return {dx: e.v, dv: a(e)}
            }

            function c(c, d) {
                var e = {
                    dx: c.v,
                    dv: a(c)
                }, f = b(c, .5 * d, e), g = b(c, .5 * d, f), h = b(c, d, g), i = 1 / 6 * (e.dx + 2 * (f.dx + g.dx) + h.dx), j = 1 / 6 * (e.dv + 2 * (f.dv + g.dv) + h.dv);
                return c.x = c.x + i * d, c.v = c.v + j * d, c
            }

            return function d(a, b, e) {
                var f, g, h, i = {x: -1, v: 0, tension: null, friction: null}, j = [0], k = 0, l = 1e-4, m = .016;
                for (a = parseFloat(a) || 500, b = parseFloat(b) || 20, e = e || null, i.tension = a, i.friction = b, f = null !== e, f ? (k = d(a, b), g = k / e * m) : g = m; h = c(h || i, g), j.push(1 + h.x), k += 16, Math.abs(h.x) > l && Math.abs(h.v) > l;);
                return f ? function (a) {
                    return j[a * (j.length - 1) | 0]
                } : k
            }
        }();
        t.Easings = {
            linear: function (a) {
                return a
            }, swing: function (a) {
                return .5 - Math.cos(a * Math.PI) / 2
            }, spring: function (a) {
                return 1 - Math.cos(4.5 * a * Math.PI) * Math.exp(6 * -a)
            }
        }, m.each([["ease", [.25, .1, .25, 1]], ["ease-in", [.42, 0, 1, 1]], ["ease-out", [0, 0, .58, 1]], ["ease-in-out", [.42, 0, .58, 1]], ["easeInSine", [.47, 0, .745, .715]], ["easeOutSine", [.39, .575, .565, 1]], ["easeInOutSine", [.445, .05, .55, .95]], ["easeInQuad", [.55, .085, .68, .53]], ["easeOutQuad", [.25, .46, .45, .94]], ["easeInOutQuad", [.455, .03, .515, .955]], ["easeInCubic", [.55, .055, .675, .19]], ["easeOutCubic", [.215, .61, .355, 1]], ["easeInOutCubic", [.645, .045, .355, 1]], ["easeInQuart", [.895, .03, .685, .22]], ["easeOutQuart", [.165, .84, .44, 1]], ["easeInOutQuart", [.77, 0, .175, 1]], ["easeInQuint", [.755, .05, .855, .06]], ["easeOutQuint", [.23, 1, .32, 1]], ["easeInOutQuint", [.86, 0, .07, 1]], ["easeInExpo", [.95, .05, .795, .035]], ["easeOutExpo", [.19, 1, .22, 1]], ["easeInOutExpo", [1, 0, 0, 1]], ["easeInCirc", [.6, .04, .98, .335]], ["easeOutCirc", [.075, .82, .165, 1]], ["easeInOutCirc", [.785, .135, .15, .86]]], function (a, b) {
            t.Easings[b[0]] = i.apply(null, b[1])
        });
        var v = t.CSS = {
            RegEx: {
                isHex: /^#([A-f\d]{3}){1,2}$/i,
                valueUnwrap: /^[A-z]+\((.*)\)$/i,
                wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
                valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi
            },
            Lists: {
                colors: ["fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"],
                transformsBase: ["translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ"],
                transforms3D: ["transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY"]
            },
            Hooks: {
                templates: {
                    textShadow: ["Color X Y Blur", "black 0px 0px 0px"],
                    boxShadow: ["Color X Y Blur Spread", "black 0px 0px 0px 0px"],
                    clip: ["Top Right Bottom Left", "0px 0px 0px 0px"],
                    backgroundPosition: ["X Y", "0% 0%"],
                    transformOrigin: ["X Y Z", "50% 50% 0px"],
                    perspectiveOrigin: ["X Y", "50% 50%"]
                }, registered: {}, register: function () {
                    for (var a = 0; a < v.Lists.colors.length; a++) {
                        var b = "color" === v.Lists.colors[a] ? "0 0 0 1" : "255 255 255 1";
                        v.Hooks.templates[v.Lists.colors[a]] = ["Red Green Blue Alpha", b]
                    }
                    var c, d, e;
                    if (n)for (c in v.Hooks.templates) {
                        d = v.Hooks.templates[c], e = d[0].split(" ");
                        var f = d[1].match(v.RegEx.valueSplit);
                        "Color" === e[0] && (e.push(e.shift()), f.push(f.shift()), v.Hooks.templates[c] = [e.join(" "), f.join(" ")])
                    }
                    for (c in v.Hooks.templates) {
                        d = v.Hooks.templates[c], e = d[0].split(" ");
                        for (var a in e) {
                            var g = c + e[a], h = a;
                            v.Hooks.registered[g] = [c, h]
                        }
                    }
                }, getRoot: function (a) {
                    var b = v.Hooks.registered[a];
                    return b ? b[0] : a
                }, cleanRootPropertyValue: function (a, b) {
                    return v.RegEx.valueUnwrap.test(b) && (b = b.match(v.RegEx.valueUnwrap)[1]), v.Values.isCSSNullValue(b) && (b = v.Hooks.templates[a][1]), b
                }, extractValue: function (a, b) {
                    var c = v.Hooks.registered[a];
                    if (c) {
                        var d = c[0], e = c[1];
                        return b = v.Hooks.cleanRootPropertyValue(d, b), b.toString().match(v.RegEx.valueSplit)[e]
                    }
                    return b
                }, injectValue: function (a, b, c) {
                    var d = v.Hooks.registered[a];
                    if (d) {
                        var e, f, g = d[0], h = d[1];
                        return c = v.Hooks.cleanRootPropertyValue(g, c), e = c.toString().match(v.RegEx.valueSplit), e[h] = b, f = e.join(" ")
                    }
                    return c
                }
            },
            Normalizations: {
                registered: {
                    clip: function (a, b, c) {
                        switch (a) {
                            case"name":
                                return "clip";
                            case"extract":
                                var d;
                                return v.RegEx.wrappedValueAlreadyExtracted.test(c) ? d = c : (d = c.toString().match(v.RegEx.valueUnwrap), d = d ? d[1].replace(/,(\s+)?/g, " ") : c), d;
                            case"inject":
                                return "rect(" + c + ")"
                        }
                    }, blur: function (a, b, c) {
                        switch (a) {
                            case"name":
                                return t.State.isFirefox ? "filter" : "-webkit-filter";
                            case"extract":
                                var d = parseFloat(c);
                                if (!d && 0 !== d) {
                                    var e = c.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                                    d = e ? e[1] : 0
                                }
                                return d;
                            case"inject":
                                return parseFloat(c) ? "blur(" + c + ")" : "none"
                        }
                    }, opacity: function (a, b, c) {
                        if (8 >= n)switch (a) {
                            case"name":
                                return "filter";
                            case"extract":
                                var d = c.toString().match(/alpha\(opacity=(.*)\)/i);
                                return c = d ? d[1] / 100 : 1;
                            case"inject":
                                return b.style.zoom = 1, parseFloat(c) >= 1 ? "" : "alpha(opacity=" + parseInt(100 * parseFloat(c), 10) + ")"
                        } else switch (a) {
                            case"name":
                                return "opacity";
                            case"extract":
                                return c;
                            case"inject":
                                return c
                        }
                    }
                }, register: function () {
                    9 >= n || t.State.isGingerbread || (v.Lists.transformsBase = v.Lists.transformsBase.concat(v.Lists.transforms3D));
                    for (var a = 0; a < v.Lists.transformsBase.length; a++)!function () {
                        var b = v.Lists.transformsBase[a];
                        v.Normalizations.registered[b] = function (a, c, e) {
                            switch (a) {
                                case"name":
                                    return "transform";
                                case"extract":
                                    return g(c) === d || g(c).transformCache[b] === d ? /^scale/i.test(b) ? 1 : 0 : g(c).transformCache[b].replace(/[()]/g, "");
                                case"inject":
                                    var f = !1;
                                    switch (b.substr(0, b.length - 1)) {
                                        case"translate":
                                            f = !/(%|px|em|rem|vw|vh|\d)$/i.test(e);
                                            break;
                                        case"scal":
                                        case"scale":
                                            t.State.isAndroid && g(c).transformCache[b] === d && 1 > e && (e = 1), f = !/(\d)$/i.test(e);
                                            break;
                                        case"skew":
                                            f = !/(deg|\d)$/i.test(e);
                                            break;
                                        case"rotate":
                                            f = !/(deg|\d)$/i.test(e)
                                    }
                                    return f || (g(c).transformCache[b] = "(" + e + ")"), g(c).transformCache[b]
                            }
                        }
                    }();
                    for (var a = 0; a < v.Lists.colors.length; a++)!function () {
                        var b = v.Lists.colors[a];
                        v.Normalizations.registered[b] = function (a, c, e) {
                            switch (a) {
                                case"name":
                                    return b;
                                case"extract":
                                    var f;
                                    if (v.RegEx.wrappedValueAlreadyExtracted.test(e))f = e; else {
                                        var g, h = {
                                            black: "rgb(0, 0, 0)",
                                            blue: "rgb(0, 0, 255)",
                                            gray: "rgb(128, 128, 128)",
                                            green: "rgb(0, 128, 0)",
                                            red: "rgb(255, 0, 0)",
                                            white: "rgb(255, 255, 255)"
                                        };
                                        /^[A-z]+$/i.test(e) ? g = h[e] !== d ? h[e] : h.black : v.RegEx.isHex.test(e) ? g = "rgb(" + v.Values.hexToRgb(e).join(" ") + ")" : /^rgba?\(/i.test(e) || (g = h.black), f = (g || e).toString().match(v.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ")
                                    }
                                    return 8 >= n || 3 !== f.split(" ").length || (f += " 1"), f;
                                case"inject":
                                    return 8 >= n ? 4 === e.split(" ").length && (e = e.split(/\s+/).slice(0, 3).join(" ")) : 3 === e.split(" ").length && (e += " 1"), (8 >= n ? "rgb" : "rgba") + "(" + e.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")"
                            }
                        }
                    }()
                }
            },
            Names: {
                camelCase: function (a) {
                    return a.replace(/-(\w)/g, function (a, b) {
                        return b.toUpperCase()
                    })
                }, SVGAttribute: function (a) {
                    var b = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";
                    return (n || t.State.isAndroid && !t.State.isChrome) && (b += "|transform"), new RegExp("^(" + b + ")$", "i").test(a)
                }, prefixCheck: function (a) {
                    if (t.State.prefixMatches[a])return [t.State.prefixMatches[a], !0];
                    for (var b = ["", "Webkit", "Moz", "ms", "O"], c = 0, d = b.length; d > c; c++) {
                        var e;
                        if (e = 0 === c ? a : b[c] + a.replace(/^\w/, function (a) {
                                return a.toUpperCase()
                            }), p.isString(t.State.prefixElement.style[e]))return t.State.prefixMatches[a] = e, [e, !0]
                    }
                    return [a, !1]
                }
            },
            Values: {
                hexToRgb: function (a) {
                    var b, c = /^#?([a-f\d])([a-f\d])([a-f\d])$/i, d = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
                    return a = a.replace(c, function (a, b, c, d) {
                        return b + b + c + c + d + d
                    }), b = d.exec(a), b ? [parseInt(b[1], 16), parseInt(b[2], 16), parseInt(b[3], 16)] : [0, 0, 0]
                }, isCSSNullValue: function (a) {
                    return 0 == a || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(a)
                }, getUnitType: function (a) {
                    return /^(rotate|skew)/i.test(a) ? "deg" : /(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(a) ? "" : "px"
                }, getDisplayType: function (a) {
                    var b = a && a.tagName.toString().toLowerCase();
                    return /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(b) ? "inline" : /^(li)$/i.test(b) ? "list-item" : /^(tr)$/i.test(b) ? "table-row" : /^(table)$/i.test(b) ? "table" : /^(tbody)$/i.test(b) ? "table-row-group" : "block"
                }, addClass: function (a, b) {
                    a.classList ? a.classList.add(b) : a.className += (a.className.length ? " " : "") + b
                }, removeClass: function (a, b) {
                    a.classList ? a.classList.remove(b) : a.className = a.className.toString().replace(new RegExp("(^|\\s)" + b.split(" ").join("|") + "(\\s|$)", "gi"), " ")
                }
            },
            getPropertyValue: function (a, c, e, f) {
                function h(a, c) {
                    function e() {
                        j && v.setPropertyValue(a, "display", "none")
                    }

                    var i = 0;
                    if (8 >= n)i = m.css(a, c); else {
                        var j = !1;
                        if (/^(width|height)$/.test(c) && 0 === v.getPropertyValue(a, "display") && (j = !0, v.setPropertyValue(a, "display", v.Values.getDisplayType(a))), !f) {
                            if ("height" === c && "border-box" !== v.getPropertyValue(a, "boxSizing").toString().toLowerCase()) {
                                var k = a.offsetHeight - (parseFloat(v.getPropertyValue(a, "borderTopWidth")) || 0) - (parseFloat(v.getPropertyValue(a, "borderBottomWidth")) || 0) - (parseFloat(v.getPropertyValue(a, "paddingTop")) || 0) - (parseFloat(v.getPropertyValue(a, "paddingBottom")) || 0);
                                return e(), k
                            }
                            if ("width" === c && "border-box" !== v.getPropertyValue(a, "boxSizing").toString().toLowerCase()) {
                                var l = a.offsetWidth - (parseFloat(v.getPropertyValue(a, "borderLeftWidth")) || 0) - (parseFloat(v.getPropertyValue(a, "borderRightWidth")) || 0) - (parseFloat(v.getPropertyValue(a, "paddingLeft")) || 0) - (parseFloat(v.getPropertyValue(a, "paddingRight")) || 0);
                                return e(), l
                            }
                        }
                        var o;
                        o = g(a) === d ? b.getComputedStyle(a, null) : g(a).computedStyle ? g(a).computedStyle : g(a).computedStyle = b.getComputedStyle(a, null), "borderColor" === c && (c = "borderTopColor"), i = 9 === n && "filter" === c ? o.getPropertyValue(c) : o[c], ("" === i || null === i) && (i = a.style[c]), e()
                    }
                    if ("auto" === i && /^(top|right|bottom|left)$/i.test(c)) {
                        var p = h(a, "position");
                        ("fixed" === p || "absolute" === p && /top|left/i.test(c)) && (i = m(a).position()[c] + "px")
                    }
                    return i
                }

                var i;
                if (v.Hooks.registered[c]) {
                    var j = c, k = v.Hooks.getRoot(j);
                    e === d && (e = v.getPropertyValue(a, v.Names.prefixCheck(k)[0])), v.Normalizations.registered[k] && (e = v.Normalizations.registered[k]("extract", a, e)), i = v.Hooks.extractValue(j, e)
                } else if (v.Normalizations.registered[c]) {
                    var l, o;
                    l = v.Normalizations.registered[c]("name", a), "transform" !== l && (o = h(a, v.Names.prefixCheck(l)[0]), v.Values.isCSSNullValue(o) && v.Hooks.templates[c] && (o = v.Hooks.templates[c][1])), i = v.Normalizations.registered[c]("extract", a, o)
                }
                if (!/^[\d-]/.test(i))if (g(a) && g(a).isSVG && v.Names.SVGAttribute(c))if (/^(height|width)$/i.test(c))try {
                    i = a.getBBox()[c]
                } catch (p) {
                    i = 0
                } else i = a.getAttribute(c); else i = h(a, v.Names.prefixCheck(c)[0]);
                return v.Values.isCSSNullValue(i) && (i = 0), t.debug >= 2 && console.log("Get " + c + ": " + i), i
            },
            setPropertyValue: function (a, c, d, e, f) {
                var h = c;
                if ("scroll" === c)f.container ? f.container["scroll" + f.direction] = d : "Left" === f.direction ? b.scrollTo(d, f.alternateValue) : b.scrollTo(f.alternateValue, d); else if (v.Normalizations.registered[c] && "transform" === v.Normalizations.registered[c]("name", a))v.Normalizations.registered[c]("inject", a, d), h = "transform", d = g(a).transformCache[c]; else {
                    if (v.Hooks.registered[c]) {
                        var i = c, j = v.Hooks.getRoot(c);
                        e = e || v.getPropertyValue(a, j), d = v.Hooks.injectValue(i, d, e), c = j
                    }
                    if (v.Normalizations.registered[c] && (d = v.Normalizations.registered[c]("inject", a, d), c = v.Normalizations.registered[c]("name", a)), h = v.Names.prefixCheck(c)[0], 8 >= n)try {
                        a.style[h] = d
                    } catch (k) {
                        t.debug && console.log("Browser does not support [" + d + "] for [" + h + "]")
                    } else g(a) && g(a).isSVG && v.Names.SVGAttribute(c) ? a.setAttribute(c, d) : a.style[h] = d;
                    t.debug >= 2 && console.log("Set " + c + " (" + h + "): " + d)
                }
                return [h, d]
            },
            flushTransformCache: function (a) {
                function b(b) {
                    return parseFloat(v.getPropertyValue(a, b))
                }

                var c = "";
                if ((n || t.State.isAndroid && !t.State.isChrome) && g(a).isSVG) {
                    var d = {
                        translate: [b("translateX"), b("translateY")],
                        skewX: [b("skewX")],
                        skewY: [b("skewY")],
                        scale: 1 !== b("scale") ? [b("scale"), b("scale")] : [b("scaleX"), b("scaleY")],
                        rotate: [b("rotateZ"), 0, 0]
                    };
                    m.each(g(a).transformCache, function (a) {
                        /^translate/i.test(a) ? a = "translate" : /^scale/i.test(a) ? a = "scale" : /^rotate/i.test(a) && (a = "rotate"), d[a] && (c += a + "(" + d[a].join(" ") + ") ", delete d[a])
                    })
                } else {
                    var e, f;
                    m.each(g(a).transformCache, function (b) {
                        return e = g(a).transformCache[b], "transformPerspective" === b ? (f = e, !0) : (9 === n && "rotateZ" === b && (b = "rotate"), void(c += b + e + " "))
                    }), f && (c = "perspective" + f + " " + c)
                }
                v.setPropertyValue(a, "transform", c)
            }
        };
        v.Hooks.register(), v.Normalizations.register(), t.hook = function (a, b, c) {
            var e = d;
            return a = f(a), m.each(a, function (a, f) {
                if (g(f) === d && t.init(f), c === d)e === d && (e = t.CSS.getPropertyValue(f, b)); else {
                    var h = t.CSS.setPropertyValue(f, b, c);
                    "transform" === h[0] && t.CSS.flushTransformCache(f), e = h
                }
            }), e
        };
        var w = function () {
            function a() {
                return h ? B.promise || null : i
            }

            function e() {
                function a(a) {
                    function l(a, b) {
                        var c = d, e = d, g = d;
                        return p.isArray(a) ? (c = a[0], !p.isArray(a[1]) && /^[\d-]/.test(a[1]) || p.isFunction(a[1]) || v.RegEx.isHex.test(a[1]) ? g = a[1] : (p.isString(a[1]) && !v.RegEx.isHex.test(a[1]) || p.isArray(a[1])) && (e = b ? a[1] : j(a[1], h.duration), a[2] !== d && (g = a[2]))) : c = a, b || (e = e || h.easing), p.isFunction(c) && (c = c.call(f, y, x)), p.isFunction(g) && (g = g.call(f, y, x)), [c || 0, e, g]
                    }

                    function n(a, b) {
                        var c, d;
                        return d = (b || "0").toString().toLowerCase().replace(/[%A-z]+$/, function (a) {
                            return c = a, ""
                        }), c || (c = v.Values.getUnitType(a)), [d, c]
                    }

                    function r() {
                        var a = {
                            myParent: f.parentNode || c.body,
                            position: v.getPropertyValue(f, "position"),
                            fontSize: v.getPropertyValue(f, "fontSize")
                        }, d = a.position === I.lastPosition && a.myParent === I.lastParent, e = a.fontSize === I.lastFontSize;
                        I.lastParent = a.myParent, I.lastPosition = a.position, I.lastFontSize = a.fontSize;
                        var h = 100, i = {};
                        if (e && d)i.emToPx = I.lastEmToPx, i.percentToPxWidth = I.lastPercentToPxWidth, i.percentToPxHeight = I.lastPercentToPxHeight; else {
                            var j = g(f).isSVG ? c.createElementNS("http://www.w3.org/2000/svg", "rect") : c.createElement("div");
                            t.init(j), a.myParent.appendChild(j), m.each(["overflow", "overflowX", "overflowY"], function (a, b) {
                                t.CSS.setPropertyValue(j, b, "hidden")
                            }), t.CSS.setPropertyValue(j, "position", a.position), t.CSS.setPropertyValue(j, "fontSize", a.fontSize), t.CSS.setPropertyValue(j, "boxSizing", "content-box"), m.each(["minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height"], function (a, b) {
                                t.CSS.setPropertyValue(j, b, h + "%")
                            }), t.CSS.setPropertyValue(j, "paddingLeft", h + "em"), i.percentToPxWidth = I.lastPercentToPxWidth = (parseFloat(v.getPropertyValue(j, "width", null, !0)) || 1) / h, i.percentToPxHeight = I.lastPercentToPxHeight = (parseFloat(v.getPropertyValue(j, "height", null, !0)) || 1) / h, i.emToPx = I.lastEmToPx = (parseFloat(v.getPropertyValue(j, "paddingLeft")) || 1) / h, a.myParent.removeChild(j)
                        }
                        return null === I.remToPx && (I.remToPx = parseFloat(v.getPropertyValue(c.body, "fontSize")) || 16), null === I.vwToPx && (I.vwToPx = parseFloat(b.innerWidth) / 100, I.vhToPx = parseFloat(b.innerHeight) / 100), i.remToPx = I.remToPx, i.vwToPx = I.vwToPx, i.vhToPx = I.vhToPx, t.debug >= 1 && console.log("Unit ratios: " + JSON.stringify(i), f), i
                    }

                    if (h.begin && 0 === y)try {
                        h.begin.call(o, o)
                    } catch (u) {
                        setTimeout(function () {
                            throw u
                        }, 1)
                    }
                    if ("scroll" === C) {
                        var w, z, A, D = /^x$/i.test(h.axis) ? "Left" : "Top", E = parseFloat(h.offset) || 0;
                        h.container ? p.isWrapped(h.container) || p.isNode(h.container) ? (h.container = h.container[0] || h.container, w = h.container["scroll" + D], A = w + m(f).position()[D.toLowerCase()] + E) : h.container = null : (w = t.State.scrollAnchor[t.State["scrollProperty" + D]], z = t.State.scrollAnchor[t.State["scrollProperty" + ("Left" === D ? "Top" : "Left")]], A = m(f).offset()[D.toLowerCase()] + E), i = {
                            scroll: {
                                rootPropertyValue: !1,
                                startValue: w,
                                currentValue: w,
                                endValue: A,
                                unitType: "",
                                easing: h.easing,
                                scrollData: {container: h.container, direction: D, alternateValue: z}
                            }, element: f
                        }, t.debug && console.log("tweensContainer (scroll): ", i.scroll, f)
                    } else if ("reverse" === C) {
                        if (!g(f).tweensContainer)return void m.dequeue(f, h.queue);
                        "none" === g(f).opts.display && (g(f).opts.display = "auto"), "hidden" === g(f).opts.visibility && (g(f).opts.visibility = "visible"), g(f).opts.loop = !1, g(f).opts.begin = null, g(f).opts.complete = null, s.easing || delete h.easing, s.duration || delete h.duration, h = m.extend({}, g(f).opts, h);
                        var F = m.extend(!0, {}, g(f).tweensContainer);
                        for (var G in F)if ("element" !== G) {
                            var H = F[G].startValue;
                            F[G].startValue = F[G].currentValue = F[G].endValue, F[G].endValue = H, p.isEmptyObject(s) || (F[G].easing = h.easing), t.debug && console.log("reverse tweensContainer (" + G + "): " + JSON.stringify(F[G]), f)
                        }
                        i = F
                    } else if ("start" === C) {
                        var F;
                        g(f).tweensContainer && g(f).isAnimating === !0 && (F = g(f).tweensContainer), m.each(q, function (a, b) {
                            if (RegExp("^" + v.Lists.colors.join("$|^") + "$").test(a)) {
                                var c = l(b, !0), e = c[0], f = c[1], g = c[2];
                                if (v.RegEx.isHex.test(e)) {
                                    for (var h = ["Red", "Green", "Blue"], i = v.Values.hexToRgb(e), j = g ? v.Values.hexToRgb(g) : d, k = 0; k < h.length; k++) {
                                        var m = [i[k]];
                                        f && m.push(f), j !== d && m.push(j[k]), q[a + h[k]] = m
                                    }
                                    delete q[a]
                                }
                            }
                        });
                        for (var K in q) {
                            var L = l(q[K]), M = L[0], N = L[1], O = L[2];
                            K = v.Names.camelCase(K);
                            var P = v.Hooks.getRoot(K), Q = !1;
                            if (g(f).isSVG || "tween" === P || v.Names.prefixCheck(P)[1] !== !1 || v.Normalizations.registered[P] !== d) {
                                (h.display !== d && null !== h.display && "none" !== h.display || h.visibility !== d && "hidden" !== h.visibility) && /opacity|filter/.test(K) && !O && 0 !== M && (O = 0), h._cacheValues && F && F[K] ? (O === d && (O = F[K].endValue + F[K].unitType), Q = g(f).rootPropertyValueCache[P]) : v.Hooks.registered[K] ? O === d ? (Q = v.getPropertyValue(f, P), O = v.getPropertyValue(f, K, Q)) : Q = v.Hooks.templates[P][1] : O === d && (O = v.getPropertyValue(f, K));
                                var R, S, T, U = !1;
                                if (R = n(K, O), O = R[0], T = R[1], R = n(K, M), M = R[0].replace(/^([+-\/*])=/, function (a, b) {
                                        return U = b, ""
                                    }), S = R[1], O = parseFloat(O) || 0, M = parseFloat(M) || 0, "%" === S && (/^(fontSize|lineHeight)$/.test(K) ? (M /= 100, S = "em") : /^scale/.test(K) ? (M /= 100, S = "") : /(Red|Green|Blue)$/i.test(K) && (M = M / 100 * 255, S = "")), /[\/*]/.test(U))S = T; else if (T !== S && 0 !== O)if (0 === M)S = T; else {
                                    e = e || r();
                                    var V = /margin|padding|left|right|width|text|word|letter/i.test(K) || /X$/.test(K) || "x" === K ? "x" : "y";
                                    switch (T) {
                                        case"%":
                                            O *= "x" === V ? e.percentToPxWidth : e.percentToPxHeight;
                                            break;
                                        case"px":
                                            break;
                                        default:
                                            O *= e[T + "ToPx"]
                                    }
                                    switch (S) {
                                        case"%":
                                            O *= 1 / ("x" === V ? e.percentToPxWidth : e.percentToPxHeight);
                                            break;
                                        case"px":
                                            break;
                                        default:
                                            O *= 1 / e[S + "ToPx"]
                                    }
                                }
                                switch (U) {
                                    case"+":
                                        M = O + M;
                                        break;
                                    case"-":
                                        M = O - M;
                                        break;
                                    case"*":
                                        M = O * M;
                                        break;
                                    case"/":
                                        M = O / M
                                }
                                i[K] = {
                                    rootPropertyValue: Q,
                                    startValue: O,
                                    currentValue: O,
                                    endValue: M,
                                    unitType: S,
                                    easing: N
                                }, t.debug && console.log("tweensContainer (" + K + "): " + JSON.stringify(i[K]), f)
                            } else t.debug && console.log("Skipping [" + P + "] due to a lack of browser support.")
                        }
                        i.element = f
                    }
                    i.element && (v.Values.addClass(f, "velocity-animating"), J.push(i), "" === h.queue && (g(f).tweensContainer = i, g(f).opts = h), g(f).isAnimating = !0, y === x - 1 ? (t.State.calls.push([J, o, h, null, B.resolver]), t.State.isTicking === !1 && (t.State.isTicking = !0, k())) : y++)
                }

                var e, f = this, h = m.extend({}, t.defaults, s), i = {};
                switch (g(f) === d && t.init(f), parseFloat(h.delay) && h.queue !== !1 && m.queue(f, h.queue, function (a) {
                    t.velocityQueueEntryFlag = !0, g(f).delayTimer = {
                        setTimeout: setTimeout(a, parseFloat(h.delay)),
                        next: a
                    }
                }), h.duration.toString().toLowerCase()) {
                    case"fast":
                        h.duration = 200;
                        break;
                    case"normal":
                        h.duration = r;
                        break;
                    case"slow":
                        h.duration = 600;
                        break;
                    default:
                        h.duration = parseFloat(h.duration) || 1
                }
                t.mock !== !1 && (t.mock === !0 ? h.duration = h.delay = 1 : (h.duration *= parseFloat(t.mock) || 1, h.delay *= parseFloat(t.mock) || 1)), h.easing = j(h.easing, h.duration), h.begin && !p.isFunction(h.begin) && (h.begin = null), h.progress && !p.isFunction(h.progress) && (h.progress = null), h.complete && !p.isFunction(h.complete) && (h.complete = null), h.display !== d && null !== h.display && (h.display = h.display.toString().toLowerCase(), "auto" === h.display && (h.display = t.CSS.Values.getDisplayType(f))), h.visibility !== d && null !== h.visibility && (h.visibility = h.visibility.toString().toLowerCase()), h.mobileHA = h.mobileHA && t.State.isMobile && !t.State.isGingerbread, h.queue === !1 ? h.delay ? setTimeout(a, h.delay) : a() : m.queue(f, h.queue, function (b, c) {
                    return c === !0 ? (B.promise && B.resolver(o), !0) : (t.velocityQueueEntryFlag = !0, void a(b))
                }), "" !== h.queue && "fx" !== h.queue || "inprogress" === m.queue(f)[0] || m.dequeue(f)
            }

            var h, i, n, o, q, s, u = arguments[0] && (arguments[0].p || m.isPlainObject(arguments[0].properties) && !arguments[0].properties.names || p.isString(arguments[0].properties));
            if (p.isWrapped(this) ? (h = !1, n = 0, o = this, i = this) : (h = !0, n = 1, o = u ? arguments[0].elements || arguments[0].e : arguments[0]), o = f(o)) {
                u ? (q = arguments[0].properties || arguments[0].p, s = arguments[0].options || arguments[0].o) : (q = arguments[n], s = arguments[n + 1]);
                var x = o.length, y = 0;
                if (!/^(stop|finish)$/i.test(q) && !m.isPlainObject(s)) {
                    var z = n + 1;
                    s = {};
                    for (var A = z; A < arguments.length; A++)p.isArray(arguments[A]) || !/^(fast|normal|slow)$/i.test(arguments[A]) && !/^\d/.test(arguments[A]) ? p.isString(arguments[A]) || p.isArray(arguments[A]) ? s.easing = arguments[A] : p.isFunction(arguments[A]) && (s.complete = arguments[A]) : s.duration = arguments[A]
                }
                var B = {promise: null, resolver: null, rejecter: null};
                h && t.Promise && (B.promise = new t.Promise(function (a, b) {
                    B.resolver = a, B.rejecter = b
                }));
                var C;
                switch (q) {
                    case"scroll":
                        C = "scroll";
                        break;
                    case"reverse":
                        C = "reverse";
                        break;
                    case"finish":
                    case"stop":
                        m.each(o, function (a, b) {
                            g(b) && g(b).delayTimer && (clearTimeout(g(b).delayTimer.setTimeout), g(b).delayTimer.next && g(b).delayTimer.next(), delete g(b).delayTimer)
                        });
                        var D = [];
                        return m.each(t.State.calls, function (a, b) {
                            b && m.each(b[1], function (c, e) {
                                var f = s === d ? "" : s;
                                return f === !0 || b[2].queue === f || s === d && b[2].queue === !1 ? void m.each(o, function (c, d) {
                                    d === e && ((s === !0 || p.isString(s)) && (m.each(m.queue(d, p.isString(s) ? s : ""), function (a, b) {
                                        p.isFunction(b) && b(null, !0)
                                    }), m.queue(d, p.isString(s) ? s : "", [])), "stop" === q ? (g(d) && g(d).tweensContainer && f !== !1 && m.each(g(d).tweensContainer, function (a, b) {
                                        b.endValue = b.currentValue
                                    }), D.push(a)) : "finish" === q && (b[2].duration = 1))
                                }) : !0
                            })
                        }), "stop" === q && (m.each(D, function (a, b) {
                            l(b, !0)
                        }), B.promise && B.resolver(o)), a();
                    default:
                        if (!m.isPlainObject(q) || p.isEmptyObject(q)) {
                            if (p.isString(q) && t.Redirects[q]) {
                                var E = m.extend({}, s), F = E.duration, G = E.delay || 0;
                                return E.backwards === !0 && (o = m.extend(!0, [], o).reverse()), m.each(o, function (a, b) {
                                    parseFloat(E.stagger) ? E.delay = G + parseFloat(E.stagger) * a : p.isFunction(E.stagger) && (E.delay = G + E.stagger.call(b, a, x)), E.drag && (E.duration = parseFloat(F) || (/^(callout|transition)/.test(q) ? 1e3 : r), E.duration = Math.max(E.duration * (E.backwards ? 1 - a / x : (a + 1) / x), .75 * E.duration, 200)), t.Redirects[q].call(b, b, E || {}, a, x, o, B.promise ? B : d)
                                }), a()
                            }
                            var H = "Velocity: First argument (" + q + ") was not a property map, a known action, or a registered redirect. Aborting.";
                            return B.promise ? B.rejecter(new Error(H)) : console.log(H), a()
                        }
                        C = "start"
                }
                var I = {
                    lastParent: null,
                    lastPosition: null,
                    lastFontSize: null,
                    lastPercentToPxWidth: null,
                    lastPercentToPxHeight: null,
                    lastEmToPx: null,
                    remToPx: null,
                    vwToPx: null,
                    vhToPx: null
                }, J = [];
                m.each(o, function (a, b) {
                    p.isNode(b) && e.call(b)
                });
                var K, E = m.extend({}, t.defaults, s);
                if (E.loop = parseInt(E.loop), K = 2 * E.loop - 1, E.loop)for (var L = 0; K > L; L++) {
                    var M = {delay: E.delay, progress: E.progress};
                    L === K - 1 && (M.display = E.display, M.visibility = E.visibility, M.complete = E.complete), w(o, "reverse", M)
                }
                return a()
            }
        };
        t = m.extend(w, t), t.animate = w;
        var x = b.requestAnimationFrame || o;
        return t.State.isMobile || c.hidden === d || c.addEventListener("visibilitychange", function () {
            c.hidden ? (x = function (a) {
                return setTimeout(function () {
                    a(!0)
                }, 16)
            }, k()) : x = b.requestAnimationFrame || o
        }), a.Velocity = t, a !== b && (a.fn.velocity = w, a.fn.velocity.defaults = t.defaults), m.each(["Down", "Up"], function (a, b) {
            t.Redirects["slide" + b] = function (a, c, e, f, g, h) {
                var i = m.extend({}, c), j = i.begin, k = i.complete, l = {
                    height: "",
                    marginTop: "",
                    marginBottom: "",
                    paddingTop: "",
                    paddingBottom: ""
                }, n = {};
                i.display === d && (i.display = "Down" === b ? "inline" === t.CSS.Values.getDisplayType(a) ? "inline-block" : "block" : "none"), i.begin = function () {
                    j && j.call(g, g);
                    for (var c in l) {
                        n[c] = a.style[c];
                        var d = t.CSS.getPropertyValue(a, c);
                        l[c] = "Down" === b ? [d, 0] : [0, d]
                    }
                    n.overflow = a.style.overflow, a.style.overflow = "hidden"
                }, i.complete = function () {
                    for (var b in n)a.style[b] = n[b];
                    k && k.call(g, g), h && h.resolver(g)
                }, t(a, l, i)
            }
        }), m.each(["In", "Out"], function (a, b) {
            t.Redirects["fade" + b] = function (a, c, e, f, g, h) {
                var i = m.extend({}, c), j = {opacity: "In" === b ? 1 : 0}, k = i.complete;
                i.complete = e !== f - 1 ? i.begin = null : function () {
                    k && k.call(g, g), h && h.resolver(g)
                }, i.display === d && (i.display = "In" === b ? "auto" : "none"), t(this, j, i)
            }
        }), t
    }(window.jQuery || window.Zepto || window, window, document)
})), !function (a, b, c, d) {
    "use strict";
    function e(a, b, c) {
        return setTimeout(k(a, c), b)
    }

    function f(a, b, c) {
        return Array.isArray(a) ? (g(a, c[b], c), !0) : !1
    }

    function g(a, b, c) {
        var e;
        if (a)if (a.forEach)a.forEach(b, c); else if (a.length !== d)for (e = 0; e < a.length;)b.call(c, a[e], e, a), e++; else for (e in a)a.hasOwnProperty(e) && b.call(c, a[e], e, a)
    }

    function h(a, b, c) {
        for (var e = Object.keys(b), f = 0; f < e.length;)(!c || c && a[e[f]] === d) && (a[e[f]] = b[e[f]]), f++;
        return a
    }

    function i(a, b) {
        return h(a, b, !0)
    }

    function j(a, b, c) {
        var d, e = b.prototype;
        d = a.prototype = Object.create(e), d.constructor = a, d._super = e, c && h(d, c)
    }

    function k(a, b) {
        return function () {
            return a.apply(b, arguments)
        }
    }

    function l(a, b) {
        return typeof a == ka ? a.apply(b ? b[0] || d : d, b) : a
    }

    function m(a, b) {
        return a === d ? b : a
    }

    function n(a, b, c) {
        g(r(b), function (b) {
            a.addEventListener(b, c, !1)
        })
    }

    function o(a, b, c) {
        g(r(b), function (b) {
            a.removeEventListener(b, c, !1)
        })
    }

    function p(a, b) {
        for (; a;) {
            if (a == b)return !0;
            a = a.parentNode
        }
        return !1
    }

    function q(a, b) {
        return a.indexOf(b) > -1
    }

    function r(a) {
        return a.trim().split(/\s+/g)
    }

    function s(a, b, c) {
        if (a.indexOf && !c)return a.indexOf(b);
        for (var d = 0; d < a.length;) {
            if (c && a[d][c] == b || !c && a[d] === b)return d;
            d++
        }
        return -1
    }

    function t(a) {
        return Array.prototype.slice.call(a, 0)
    }

    function u(a, b, c) {
        for (var d = [], e = [], f = 0; f < a.length;) {
            var g = b ? a[f][b] : a[f];
            s(e, g) < 0 && d.push(a[f]), e[f] = g, f++
        }
        return c && (d = b ? d.sort(function (a, c) {
            return a[b] > c[b]
        }) : d.sort()), d
    }

    function v(a, b) {
        for (var c, e, f = b[0].toUpperCase() + b.slice(1), g = 0; g < ia.length;) {
            if (c = ia[g], e = c ? c + f : b, e in a)return e;
            g++
        }
        return d
    }

    function w() {
        return oa++
    }

    function x(a) {
        var b = a.ownerDocument;
        return b.defaultView || b.parentWindow
    }

    function y(a, b) {
        var c = this;
        this.manager = a, this.callback = b, this.element = a.element, this.target = a.options.inputTarget, this.domHandler = function (b) {
            l(a.options.enable, [a]) && c.handler(b)
        }, this.init()
    }

    function z(a) {
        var b, c = a.options.inputClass;
        return new (b = c ? c : ra ? N : sa ? Q : qa ? S : M)(a, A)
    }

    function A(a, b, c) {
        var d = c.pointers.length, e = c.changedPointers.length, f = b & ya && 0 === d - e, g = b & (Aa | Ba) && 0 === d - e;
        c.isFirst = !!f, c.isFinal = !!g, f && (a.session = {}), c.eventType = b, B(a, c), a.emit("hammer.input", c), a.recognize(c), a.session.prevInput = c
    }

    function B(a, b) {
        var c = a.session, d = b.pointers, e = d.length;
        c.firstInput || (c.firstInput = E(b)), e > 1 && !c.firstMultiple ? c.firstMultiple = E(b) : 1 === e && (c.firstMultiple = !1);
        var f = c.firstInput, g = c.firstMultiple, h = g ? g.center : f.center, i = b.center = F(d);
        b.timeStamp = na(), b.deltaTime = b.timeStamp - f.timeStamp, b.angle = J(h, i), b.distance = I(h, i), C(c, b), b.offsetDirection = H(b.deltaX, b.deltaY), b.scale = g ? L(g.pointers, d) : 1, b.rotation = g ? K(g.pointers, d) : 0, D(c, b);
        var j = a.element;
        p(b.srcEvent.target, j) && (j = b.srcEvent.target), b.target = j
    }

    function C(a, b) {
        var c = b.center, d = a.offsetDelta || {}, e = a.prevDelta || {}, f = a.prevInput || {};
        (b.eventType === ya || f.eventType === Aa) && (e = a.prevDelta = {
            x: f.deltaX || 0,
            y: f.deltaY || 0
        }, d = a.offsetDelta = {x: c.x, y: c.y}), b.deltaX = e.x + (c.x - d.x), b.deltaY = e.y + (c.y - d.y)
    }

    function D(a, b) {
        var c, e, f, g, h = a.lastInterval || b, i = b.timeStamp - h.timeStamp;
        if (b.eventType != Ba && (i > xa || h.velocity === d)) {
            var j = h.deltaX - b.deltaX, k = h.deltaY - b.deltaY, l = G(i, j, k);
            e = l.x, f = l.y, c = ma(l.x) > ma(l.y) ? l.x : l.y, g = H(j, k), a.lastInterval = b
        } else c = h.velocity, e = h.velocityX, f = h.velocityY, g = h.direction;
        b.velocity = c, b.velocityX = e, b.velocityY = f, b.direction = g
    }

    function E(a) {
        for (var b = [], c = 0; c < a.pointers.length;)b[c] = {
            clientX: la(a.pointers[c].clientX),
            clientY: la(a.pointers[c].clientY)
        }, c++;
        return {timeStamp: na(), pointers: b, center: F(b), deltaX: a.deltaX, deltaY: a.deltaY}
    }

    function F(a) {
        var b = a.length;
        if (1 === b)return {x: la(a[0].clientX), y: la(a[0].clientY)};
        for (var c = 0, d = 0, e = 0; b > e;)c += a[e].clientX, d += a[e].clientY, e++;
        return {x: la(c / b), y: la(d / b)}
    }

    function G(a, b, c) {
        return {x: b / a || 0, y: c / a || 0}
    }

    function H(a, b) {
        return a === b ? Ca : ma(a) >= ma(b) ? a > 0 ? Da : Ea : b > 0 ? Fa : Ga
    }

    function I(a, b, c) {
        c || (c = Ka);
        var d = b[c[0]] - a[c[0]], e = b[c[1]] - a[c[1]];
        return Math.sqrt(d * d + e * e)
    }

    function J(a, b, c) {
        c || (c = Ka);
        var d = b[c[0]] - a[c[0]], e = b[c[1]] - a[c[1]];
        return 180 * Math.atan2(e, d) / Math.PI
    }

    function K(a, b) {
        return J(b[1], b[0], La) - J(a[1], a[0], La)
    }

    function L(a, b) {
        return I(b[0], b[1], La) / I(a[0], a[1], La)
    }

    function M() {
        this.evEl = Na, this.evWin = Oa, this.allow = !0, this.pressed = !1, y.apply(this, arguments)
    }

    function N() {
        this.evEl = Ra, this.evWin = Sa, y.apply(this, arguments), this.store = this.manager.session.pointerEvents = []
    }

    function O() {
        this.evTarget = Ua, this.evWin = Va, this.started = !1, y.apply(this, arguments)
    }

    function P(a, b) {
        var c = t(a.touches), d = t(a.changedTouches);
        return b & (Aa | Ba) && (c = u(c.concat(d), "identifier", !0)), [c, d]
    }

    function Q() {
        this.evTarget = Xa, this.targetIds = {}, y.apply(this, arguments)
    }

    function R(a, b) {
        var c = t(a.touches), d = this.targetIds;
        if (b & (ya | za) && 1 === c.length)return d[c[0].identifier] = !0, [c, c];
        var e, f, g = t(a.changedTouches), h = [], i = this.target;
        if (f = c.filter(function (a) {
                return p(a.target, i)
            }), b === ya)for (e = 0; e < f.length;)d[f[e].identifier] = !0, e++;
        for (e = 0; e < g.length;)d[g[e].identifier] && h.push(g[e]), b & (Aa | Ba) && delete d[g[e].identifier], e++;
        return h.length ? [u(f.concat(h), "identifier", !0), h] : void 0
    }

    function S() {
        y.apply(this, arguments);
        var a = k(this.handler, this);
        this.touch = new Q(this.manager, a), this.mouse = new M(this.manager, a)
    }

    function T(a, b) {
        this.manager = a, this.set(b)
    }

    function U(a) {
        if (q(a, bb))return bb;
        var b = q(a, cb), c = q(a, db);
        return b && c ? cb + " " + db : b || c ? b ? cb : db : q(a, ab) ? ab : _a
    }

    function V(a) {
        this.id = w(), this.manager = null, this.options = i(a || {}, this.defaults), this.options.enable = m(this.options.enable, !0), this.state = eb, this.simultaneous = {}, this.requireFail = []
    }

    function W(a) {
        return a & jb ? "cancel" : a & hb ? "end" : a & gb ? "move" : a & fb ? "start" : ""
    }

    function X(a) {
        return a == Ga ? "down" : a == Fa ? "up" : a == Da ? "left" : a == Ea ? "right" : ""
    }

    function Y(a, b) {
        var c = b.manager;
        return c ? c.get(a) : a
    }

    function Z() {
        V.apply(this, arguments)
    }

    function $() {
        Z.apply(this, arguments), this.pX = null, this.pY = null
    }

    function _() {
        Z.apply(this, arguments)
    }

    function aa() {
        V.apply(this, arguments), this._timer = null, this._input = null
    }

    function ba() {
        Z.apply(this, arguments)
    }

    function ca() {
        Z.apply(this, arguments)
    }

    function da() {
        V.apply(this, arguments), this.pTime = !1, this.pCenter = !1, this._timer = null, this._input = null, this.count = 0
    }

    function ea(a, b) {
        return b = b || {}, b.recognizers = m(b.recognizers, ea.defaults.preset), new fa(a, b)
    }

    function fa(a, b) {
        b = b || {}, this.options = i(b, ea.defaults), this.options.inputTarget = this.options.inputTarget || a, this.handlers = {}, this.session = {}, this.recognizers = [], this.element = a, this.input = z(this), this.touchAction = new T(this, this.options.touchAction), ga(this, !0), g(b.recognizers, function (a) {
            var b = this.add(new a[0](a[1]));
            a[2] && b.recognizeWith(a[2]), a[3] && b.requireFailure(a[3])
        }, this)
    }

    function ga(a, b) {
        var c = a.element;
        g(a.options.cssProps, function (a, d) {
            c.style[v(c.style, d)] = b ? a : ""
        })
    }

    function ha(a, c) {
        var d = b.createEvent("Event");
        d.initEvent(a, !0, !0), d.gesture = c, c.target.dispatchEvent(d)
    }

    var ia = ["", "webkit", "moz", "MS", "ms", "o"], ja = b.createElement("div"), ka = "function", la = Math.round, ma = Math.abs, na = Date.now, oa = 1, pa = /mobile|tablet|ip(ad|hone|od)|android/i, qa = "ontouchstart" in a, ra = v(a, "PointerEvent") !== d, sa = qa && pa.test(navigator.userAgent), ta = "touch", ua = "pen", va = "mouse", wa = "kinect", xa = 25, ya = 1, za = 2, Aa = 4, Ba = 8, Ca = 1, Da = 2, Ea = 4, Fa = 8, Ga = 16, Ha = Da | Ea, Ia = Fa | Ga, Ja = Ha | Ia, Ka = ["x", "y"], La = ["clientX", "clientY"];
    y.prototype = {
        handler: function () {
        }, init: function () {
            this.evEl && n(this.element, this.evEl, this.domHandler), this.evTarget && n(this.target, this.evTarget, this.domHandler), this.evWin && n(x(this.element), this.evWin, this.domHandler)
        }, destroy: function () {
            this.evEl && o(this.element, this.evEl, this.domHandler), this.evTarget && o(this.target, this.evTarget, this.domHandler), this.evWin && o(x(this.element), this.evWin, this.domHandler)
        }
    };
    var Ma = {mousedown: ya, mousemove: za, mouseup: Aa}, Na = "mousedown", Oa = "mousemove mouseup";
    j(M, y, {
        handler: function (a) {
            var b = Ma[a.type];
            b & ya && 0 === a.button && (this.pressed = !0), b & za && 1 !== a.which && (b = Aa), this.pressed && this.allow && (b & Aa && (this.pressed = !1), this.callback(this.manager, b, {
                pointers: [a],
                changedPointers: [a],
                pointerType: va,
                srcEvent: a
            }))
        }
    });
    var Pa = {pointerdown: ya, pointermove: za, pointerup: Aa, pointercancel: Ba, pointerout: Ba}, Qa = {
        2: ta,
        3: ua,
        4: va,
        5: wa
    }, Ra = "pointerdown", Sa = "pointermove pointerup pointercancel";
    a.MSPointerEvent && (Ra = "MSPointerDown", Sa = "MSPointerMove MSPointerUp MSPointerCancel"), j(N, y, {
        handler: function (a) {
            var b = this.store, c = !1, d = a.type.toLowerCase().replace("ms", ""), e = Pa[d], f = Qa[a.pointerType] || a.pointerType, g = f == ta, h = s(b, a.pointerId, "pointerId");
            e & ya && (0 === a.button || g) ? 0 > h && (b.push(a), h = b.length - 1) : e & (Aa | Ba) && (c = !0), 0 > h || (b[h] = a, this.callback(this.manager, e, {
                pointers: b,
                changedPointers: [a],
                pointerType: f,
                srcEvent: a
            }), c && b.splice(h, 1))
        }
    });
    var Ta = {
        touchstart: ya,
        touchmove: za,
        touchend: Aa,
        touchcancel: Ba
    }, Ua = "touchstart", Va = "touchstart touchmove touchend touchcancel";
    j(O, y, {
        handler: function (a) {
            var b = Ta[a.type];
            if (b === ya && (this.started = !0), this.started) {
                var c = P.call(this, a, b);
                b & (Aa | Ba) && 0 === c[0].length - c[1].length && (this.started = !1), this.callback(this.manager, b, {
                    pointers: c[0],
                    changedPointers: c[1],
                    pointerType: ta,
                    srcEvent: a
                })
            }
        }
    });
    var Wa = {
        touchstart: ya,
        touchmove: za,
        touchend: Aa,
        touchcancel: Ba
    }, Xa = "touchstart touchmove touchend touchcancel";
    j(Q, y, {
        handler: function (a) {
            var b = Wa[a.type], c = R.call(this, a, b);
            c && this.callback(this.manager, b, {pointers: c[0], changedPointers: c[1], pointerType: ta, srcEvent: a})
        }
    }), j(S, y, {
        handler: function (a, b, c) {
            var d = c.pointerType == ta, e = c.pointerType == va;
            if (d)this.mouse.allow = !1; else if (e && !this.mouse.allow)return;
            b & (Aa | Ba) && (this.mouse.allow = !0), this.callback(a, b, c)
        }, destroy: function () {
            this.touch.destroy(), this.mouse.destroy()
        }
    });
    var Ya = v(ja.style, "touchAction"), Za = Ya !== d, $a = "compute", _a = "auto", ab = "manipulation", bb = "none", cb = "pan-x", db = "pan-y";
    T.prototype = {
        set: function (a) {
            a == $a && (a = this.compute()), Za && (this.manager.element.style[Ya] = a), this.actions = a.toLowerCase().trim()
        }, update: function () {
            this.set(this.manager.options.touchAction)
        }, compute: function () {
            var a = [];
            return g(this.manager.recognizers, function (b) {
                l(b.options.enable, [b]) && (a = a.concat(b.getTouchAction()))
            }), U(a.join(" "))
        }, preventDefaults: function (a) {
            if (!Za) {
                var b = a.srcEvent, c = a.offsetDirection;
                if (this.manager.session.prevented)return void b.preventDefault();
                var d = this.actions, e = q(d, bb), f = q(d, db), g = q(d, cb);
                return e || f && c & Ha || g && c & Ia ? this.preventSrc(b) : void 0
            }
        }, preventSrc: function (a) {
            this.manager.session.prevented = !0, a.preventDefault()
        }
    };
    var eb = 1, fb = 2, gb = 4, hb = 8, ib = hb, jb = 16, kb = 32;
    V.prototype = {
        defaults: {}, set: function (a) {
            return h(this.options, a), this.manager && this.manager.touchAction.update(), this
        }, recognizeWith: function (a) {
            if (f(a, "recognizeWith", this))return this;
            var b = this.simultaneous;
            return a = Y(a, this), b[a.id] || (b[a.id] = a, a.recognizeWith(this)), this
        }, dropRecognizeWith: function (a) {
            return f(a, "dropRecognizeWith", this) ? this : (a = Y(a, this), delete this.simultaneous[a.id], this)
        }, requireFailure: function (a) {
            if (f(a, "requireFailure", this))return this;
            var b = this.requireFail;
            return a = Y(a, this), -1 === s(b, a) && (b.push(a), a.requireFailure(this)), this
        }, dropRequireFailure: function (a) {
            if (f(a, "dropRequireFailure", this))return this;
            a = Y(a, this);
            var b = s(this.requireFail, a);
            return b > -1 && this.requireFail.splice(b, 1), this
        }, hasRequireFailures: function () {
            return this.requireFail.length > 0
        }, canRecognizeWith: function (a) {
            return !!this.simultaneous[a.id]
        }, emit: function (a) {
            function b(b) {
                c.manager.emit(c.options.event + (b ? W(d) : ""), a)
            }

            var c = this, d = this.state;
            hb > d && b(!0), b(), d >= hb && b(!0)
        }, tryEmit: function (a) {
            return this.canEmit() ? this.emit(a) : void(this.state = kb)
        }, canEmit: function () {
            for (var a = 0; a < this.requireFail.length;) {
                if (!(this.requireFail[a].state & (kb | eb)))return !1;
                a++
            }
            return !0
        }, recognize: function (a) {
            var b = h({}, a);
            return l(this.options.enable, [this, b]) ? (this.state & (ib | jb | kb) && (this.state = eb), this.state = this.process(b), void(this.state & (fb | gb | hb | jb) && this.tryEmit(b))) : (this.reset(), void(this.state = kb))
        }, process: function () {
        }, getTouchAction: function () {
        }, reset: function () {
        }
    }, j(Z, V, {
        defaults: {pointers: 1}, attrTest: function (a) {
            var b = this.options.pointers;
            return 0 === b || a.pointers.length === b
        }, process: function (a) {
            var b = this.state, c = a.eventType, d = b & (fb | gb), e = this.attrTest(a);
            return d && (c & Ba || !e) ? b | jb : d || e ? c & Aa ? b | hb : b & fb ? b | gb : fb : kb
        }
    }), j($, Z, {
        defaults: {event: "pan", threshold: 10, pointers: 1, direction: Ja}, getTouchAction: function () {
            var a = this.options.direction, b = [];
            return a & Ha && b.push(db), a & Ia && b.push(cb), b
        }, directionTest: function (a) {
            var b = this.options, c = !0, d = a.distance, e = a.direction, f = a.deltaX, g = a.deltaY;
            return e & b.direction || (b.direction & Ha ? (e = 0 === f ? Ca : 0 > f ? Da : Ea, c = f != this.pX, d = Math.abs(a.deltaX)) : (e = 0 === g ? Ca : 0 > g ? Fa : Ga, c = g != this.pY, d = Math.abs(a.deltaY))), a.direction = e, c && d > b.threshold && e & b.direction
        }, attrTest: function (a) {
            return Z.prototype.attrTest.call(this, a) && (this.state & fb || !(this.state & fb) && this.directionTest(a))
        }, emit: function (a) {
            this.pX = a.deltaX, this.pY = a.deltaY;
            var b = X(a.direction);
            b && this.manager.emit(this.options.event + b, a), this._super.emit.call(this, a)
        }
    }), j(_, Z, {
        defaults: {event: "pinch", threshold: 0, pointers: 2}, getTouchAction: function () {
            return [bb]
        }, attrTest: function (a) {
            return this._super.attrTest.call(this, a) && (Math.abs(a.scale - 1) > this.options.threshold || this.state & fb)
        }, emit: function (a) {
            if (this._super.emit.call(this, a), 1 !== a.scale) {
                var b = a.scale < 1 ? "in" : "out";
                this.manager.emit(this.options.event + b, a)
            }
        }
    }), j(aa, V, {
        defaults: {event: "press", pointers: 1, time: 500, threshold: 5}, getTouchAction: function () {
            return [_a]
        }, process: function (a) {
            var b = this.options, c = a.pointers.length === b.pointers, d = a.distance < b.threshold, f = a.deltaTime > b.time;
            if (this._input = a, !d || !c || a.eventType & (Aa | Ba) && !f)this.reset(); else if (a.eventType & ya)this.reset(), this._timer = e(function () {
                this.state = ib, this.tryEmit()
            }, b.time, this); else if (a.eventType & Aa)return ib;
            return kb
        }, reset: function () {
            clearTimeout(this._timer)
        }, emit: function (a) {
            this.state === ib && (a && a.eventType & Aa ? this.manager.emit(this.options.event + "up", a) : (this._input.timeStamp = na(), this.manager.emit(this.options.event, this._input)))
        }
    }), j(ba, Z, {
        defaults: {event: "rotate", threshold: 0, pointers: 2}, getTouchAction: function () {
            return [bb]
        }, attrTest: function (a) {
            return this._super.attrTest.call(this, a) && (Math.abs(a.rotation) > this.options.threshold || this.state & fb)
        }
    }), j(ca, Z, {
        defaults: {event: "swipe", threshold: 10, velocity: .65, direction: Ha | Ia, pointers: 1},
        getTouchAction: function () {
            return $.prototype.getTouchAction.call(this)
        },
        attrTest: function (a) {
            var b, c = this.options.direction;
            return c & (Ha | Ia) ? b = a.velocity : c & Ha ? b = a.velocityX : c & Ia && (b = a.velocityY), this._super.attrTest.call(this, a) && c & a.direction && a.distance > this.options.threshold && ma(b) > this.options.velocity && a.eventType & Aa
        },
        emit: function (a) {
            var b = X(a.direction);
            b && this.manager.emit(this.options.event + b, a), this.manager.emit(this.options.event, a)
        }
    }), j(da, V, {
        defaults: {
            event: "tap",
            pointers: 1,
            taps: 1,
            interval: 300,
            time: 250,
            threshold: 2,
            posThreshold: 10
        }, getTouchAction: function () {
            return [ab]
        }, process: function (a) {
            var b = this.options, c = a.pointers.length === b.pointers, d = a.distance < b.threshold, f = a.deltaTime < b.time;
            if (this.reset(), a.eventType & ya && 0 === this.count)return this.failTimeout();
            if (d && f && c) {
                if (a.eventType != Aa)return this.failTimeout();
                var g = this.pTime ? a.timeStamp - this.pTime < b.interval : !0, h = !this.pCenter || I(this.pCenter, a.center) < b.posThreshold;
                this.pTime = a.timeStamp, this.pCenter = a.center, h && g ? this.count += 1 : this.count = 1, this._input = a;
                var i = this.count % b.taps;
                if (0 === i)return this.hasRequireFailures() ? (this._timer = e(function () {
                    this.state = ib, this.tryEmit()
                }, b.interval, this), fb) : ib
            }
            return kb
        }, failTimeout: function () {
            return this._timer = e(function () {
                this.state = kb
            }, this.options.interval, this), kb
        }, reset: function () {
            clearTimeout(this._timer)
        }, emit: function () {
            this.state == ib && (this._input.tapCount = this.count, this.manager.emit(this.options.event, this._input))
        }
    }), ea.VERSION = "2.0.4", ea.defaults = {
        domEvents: !1,
        touchAction: $a,
        enable: !0,
        inputTarget: null,
        inputClass: null,
        preset: [[ba, {enable: !1}], [_, {enable: !1}, ["rotate"]], [ca, {direction: Ha}], [$, {direction: Ha}, ["swipe"]], [da], [da, {
            event: "doubletap",
            taps: 2
        }, ["tap"]], [aa]],
        cssProps: {
            userSelect: "default",
            touchSelect: "none",
            touchCallout: "none",
            contentZooming: "none",
            userDrag: "none",
            tapHighlightColor: "rgba(0,0,0,0)"
        }
    };
    var lb = 1, mb = 2;
    fa.prototype = {
        set: function (a) {
            return h(this.options, a), a.touchAction && this.touchAction.update(), a.inputTarget && (this.input.destroy(), this.input.target = a.inputTarget, this.input.init()), this
        }, stop: function (a) {
            this.session.stopped = a ? mb : lb
        }, recognize: function (a) {
            var b = this.session;
            if (!b.stopped) {
                this.touchAction.preventDefaults(a);
                var c, d = this.recognizers, e = b.curRecognizer;
                (!e || e && e.state & ib) && (e = b.curRecognizer = null);
                for (var f = 0; f < d.length;)c = d[f], b.stopped === mb || e && c != e && !c.canRecognizeWith(e) ? c.reset() : c.recognize(a), !e && c.state & (fb | gb | hb) && (e = b.curRecognizer = c), f++
            }
        }, get: function (a) {
            if (a instanceof V)return a;
            for (var b = this.recognizers, c = 0; c < b.length; c++)if (b[c].options.event == a)return b[c];
            return null
        }, add: function (a) {
            if (f(a, "add", this))return this;
            var b = this.get(a.options.event);
            return b && this.remove(b), this.recognizers.push(a), a.manager = this, this.touchAction.update(), a
        }, remove: function (a) {
            if (f(a, "remove", this))return this;
            var b = this.recognizers;
            return a = this.get(a), b.splice(s(b, a), 1), this.touchAction.update(), this
        }, on: function (a, b) {
            var c = this.handlers;
            return g(r(a), function (a) {
                c[a] = c[a] || [], c[a].push(b)
            }), this
        }, off: function (a, b) {
            var c = this.handlers;
            return g(r(a), function (a) {
                b ? c[a].splice(s(c[a], b), 1) : delete c[a]
            }), this
        }, emit: function (a, b) {
            this.options.domEvents && ha(a, b);
            var c = this.handlers[a] && this.handlers[a].slice();
            if (c && c.length) {
                b.type = a, b.preventDefault = function () {
                    b.srcEvent.preventDefault()
                };
                for (var d = 0; d < c.length;)c[d](b), d++
            }
        }, destroy: function () {
            this.element && ga(this, !1), this.handlers = {}, this.session = {}, this.input.destroy(), this.element = null
        }
    }, h(ea, {
        INPUT_START: ya,
        INPUT_MOVE: za,
        INPUT_END: Aa,
        INPUT_CANCEL: Ba,
        STATE_POSSIBLE: eb,
        STATE_BEGAN: fb,
        STATE_CHANGED: gb,
        STATE_ENDED: hb,
        STATE_RECOGNIZED: ib,
        STATE_CANCELLED: jb,
        STATE_FAILED: kb,
        DIRECTION_NONE: Ca,
        DIRECTION_LEFT: Da,
        DIRECTION_RIGHT: Ea,
        DIRECTION_UP: Fa,
        DIRECTION_DOWN: Ga,
        DIRECTION_HORIZONTAL: Ha,
        DIRECTION_VERTICAL: Ia,
        DIRECTION_ALL: Ja,
        Manager: fa,
        Input: y,
        TouchAction: T,
        TouchInput: Q,
        MouseInput: M,
        PointerEventInput: N,
        TouchMouseInput: S,
        SingleTouchInput: O,
        Recognizer: V,
        AttrRecognizer: Z,
        Tap: da,
        Pan: $,
        Swipe: ca,
        Pinch: _,
        Rotate: ba,
        Press: aa,
        on: n,
        off: o,
        each: g,
        merge: i,
        extend: h,
        inherit: j,
        bindFn: k,
        prefixed: v
    }), typeof define == ka && define.amd ? define(function () {
        return ea
    }) : "undefined" != typeof module && module.exports ? module.exports = ea : a[c] = ea
}(window, document, "Hammer"), function (a) {
    "function" == typeof define && define.amd ? define(["jquery", "hammerjs"], a) : "object" == typeof exports ? a(require("jquery"), require("hammerjs")) : a(jQuery, Hammer)
}(function (a, b) {
    function c(c, d) {
        var e = a(c);
        e.data("hammer") || e.data("hammer", new b(e[0], d))
    }

    a.fn.hammer = function (a) {
        return this.each(function () {
            c(this, a)
        })
    }, b.Manager.prototype.emit = function (b) {
        return function (c, d) {
            b.call(this, c, d), a(this.element).trigger({type: c, gesture: d})
        }
    }(b.Manager.prototype.emit)
}), function (a) {
    a.Package ? Materialize = {} : a.Materialize = {}
}(window), Materialize.guid = function () {
    function a() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
    }

    return function () {
        return a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a()
    }
}(), Materialize.elementOrParentIsFixed = function (a) {
    var b = $(a), c = b.add(b.parents()), d = !1;
    return c.each(function () {
        return "fixed" === $(this).css("position") ? (d = !0, !1) : void 0
    }), d
};
var Vel;
Vel = $ ? $.Velocity : jQuery ? jQuery.Velocity : Velocity, function (a) {
    a.fn.collapsible = function (b) {
        var c = {accordion: void 0};
        return b = a.extend(c, b), this.each(function () {
            function c(b) {
                h = g.find("> li > .collapsible-header"), b.hasClass("active") ? b.parent().addClass("active") : b.parent().removeClass("active"), b.parent().hasClass("active") ? b.siblings(".collapsible-body").stop(!0, !1).slideDown({
                    duration: 350,
                    easing: "easeOutQuart",
                    queue: !1,
                    complete: function () {
                        a(this).css("height", "")
                    }
                }) : b.siblings(".collapsible-body").stop(!0, !1).slideUp({
                    duration: 350,
                    easing: "easeOutQuart",
                    queue: !1,
                    complete: function () {
                        a(this).css("height", "")
                    }
                }), h.not(b).removeClass("active").parent().removeClass("active"), h.not(b).parent().children(".collapsible-body").stop(!0, !1).slideUp({
                    duration: 350,
                    easing: "easeOutQuart",
                    queue: !1,
                    complete: function () {
                        a(this).css("height", "")
                    }
                })
            }

            function d(b) {
                b.hasClass("active") ? b.parent().addClass("active") : b.parent().removeClass("active"), b.parent().hasClass("active") ? b.siblings(".collapsible-body").stop(!0, !1).slideDown({
                    duration: 350,
                    easing: "easeOutQuart",
                    queue: !1,
                    complete: function () {
                        a(this).css("height", "")
                    }
                }) : b.siblings(".collapsible-body").stop(!0, !1).slideUp({
                    duration: 350,
                    easing: "easeOutQuart",
                    queue: !1,
                    complete: function () {
                        a(this).css("height", "")
                    }
                })
            }

            function e(a) {
                var b = f(a);
                return b.length > 0
            }

            function f(a) {
                return a.closest("li > .collapsible-header")
            }

            var g = a(this), h = a(this).find("> li > .collapsible-header"), i = g.data("collapsible");
            g.off("click.collapse", "> li > .collapsible-header"), h.off("click.collapse"), g.on("click.collapse", "> li > .collapsible-header", function (g) {
                var h = a(this), j = a(g.target);
                e(j) && (j = f(j)), j.toggleClass("active"), b.accordion || "accordion" === i || void 0 === i ? c(j) : (d(j), h.hasClass("active") && d(h))
            });
            var h = g.find("> li > .collapsible-header");
            b.accordion || "accordion" === i || void 0 === i ? c(h.filter(".active").first()) : h.filter(".active").each(function () {
                d(a(this))
            })
        })
    }, a(document).ready(function () {
        a(".collapsible").collapsible()
    })
}(jQuery), function (a) {
    a.fn.scrollTo = function (b) {
        return a(this).scrollTop(a(this).scrollTop() - a(this).offset().top + a(b).offset().top), this
    }, a.fn.dropdown = function (b) {
        var c = {
            inDuration: 300,
            outDuration: 225,
            constrain_width: !0,
            hover: !1,
            gutter: 0,
            belowOrigin: !1,
            alignment: "left",
            stopPropagation: !1
        };
        return "open" === b ? (this.each(function () {
            a(this).trigger("open")
        }), !1) : "close" === b ? (this.each(function () {
            a(this).trigger("close")
        }), !1) : void this.each(function () {
            function b() {
                void 0 !== f.data("induration") && (g.inDuration = f.data("induration")), void 0 !== f.data("outduration") && (g.outDuration = f.data("outduration")), void 0 !== f.data("constrainwidth") && (g.constrain_width = f.data("constrainwidth")), void 0 !== f.data("hover") && (g.hover = f.data("hover")), void 0 !== f.data("gutter") && (g.gutter = f.data("gutter")), void 0 !== f.data("beloworigin") && (g.belowOrigin = f.data("beloworigin")), void 0 !== f.data("alignment") && (g.alignment = f.data("alignment")), void 0 !== f.data("stoppropagation") && (g.stopPropagation = f.data("stoppropagation"))
            }

            function d(c) {
                "focus" === c && (h = !0), b(), i.addClass("active"), f.addClass("active"), g.constrain_width === !0 ? i.css("width", f.outerWidth()) : i.css("white-space", "nowrap");
                var d = window.innerHeight, e = f.innerHeight(), j = f.offset().left, k = f.offset().top - a(window).scrollTop(), l = g.alignment, m = 0, n = 0, o = 0;
                g.belowOrigin === !0 && (o = e);
                var p = 0, q = 0, r = f.parent();
                if (r.is("body") || (r[0].scrollHeight > r[0].clientHeight && (p = r[0].scrollTop), r[0].scrollWidth > r[0].clientWidth && (q = r[0].scrollLeft)), j + i.innerWidth() > a(window).width() ? l = "right" : j - i.innerWidth() + f.innerWidth() < 0 && (l = "left"), k + i.innerHeight() > d)if (k + e - i.innerHeight() < 0) {
                    var s = d - k - o;
                    i.css("max-height", s)
                } else o || (o += e), o -= i.innerHeight();
                if ("left" === l)m = g.gutter, n = f.position().left + m; else if ("right" === l) {
                    var t = f.position().left + f.outerWidth() - i.outerWidth();
                    m = -g.gutter, n = t + m
                }
                i.css({
                    position: "absolute",
                    top: f.position().top + o + p,
                    left: n + q
                }), i.stop(!0, !0).css("opacity", 0).slideDown({
                    queue: !1,
                    duration: g.inDuration,
                    easing: "easeOutCubic",
                    complete: function () {
                        a(this).css("height", "")
                    }
                }).animate({opacity: 1}, {queue: !1, duration: g.inDuration, easing: "easeOutSine"})
            }

            function e() {
                h = !1, i.fadeOut(g.outDuration), i.removeClass("active"), f.removeClass("active"), setTimeout(function () {
                    i.css("max-height", "")
                }, g.outDuration)
            }

            var f = a(this), g = a.extend({}, c, g), h = !1, i = a("#" + f.attr("data-activates"));
            if (b(), f.after(i), g.hover) {
                var j = !1;
                f.unbind("click." + f.attr("id")), f.on("mouseenter", function (a) {
                    j === !1 && (d(), j = !0)
                }), f.on("mouseleave", function (b) {
                    var c = b.toElement || b.relatedTarget;
                    a(c).closest(".dropdown-content").is(i) || (i.stop(!0, !0), e(), j = !1)
                }), i.on("mouseleave", function (b) {
                    var c = b.toElement || b.relatedTarget;
                    a(c).closest(".dropdown-button").is(f) || (i.stop(!0, !0), e(), j = !1)
                })
            } else f.unbind("click." + f.attr("id")), f.bind("click." + f.attr("id"), function (b) {
                h || (f[0] != b.currentTarget || f.hasClass("active") || 0 !== a(b.target).closest(".dropdown-content").length ? f.hasClass("active") && (e(), a(document).unbind("click." + i.attr("id") + " touchstart." + i.attr("id"))) : (b.preventDefault(), g.stopPropagation && b.stopPropagation(), d("click")), i.hasClass("active") && a(document).bind("click." + i.attr("id") + " touchstart." + i.attr("id"), function (b) {
                    i.is(b.target) || f.is(b.target) || f.find(b.target).length || (e(), a(document).unbind("click." + i.attr("id") + " touchstart." + i.attr("id")))
                }))
            });
            f.on("open", function (a, b) {
                d(b)
            }), f.on("close", e)
        })
    }, a(document).ready(function () {
        a(".dropdown-button").dropdown()
    })
}(jQuery), function (a) {
    var b = 0, c = 0, d = function () {
        return c++, "materialize-lean-overlay-" + c
    };
    a.fn.extend({
        openModal: function (c) {
            var e = a("body"), f = e.innerWidth();
            e.css("overflow", "hidden"), e.width(f);
            var g = {
                opacity: .5,
                in_duration: 350,
                out_duration: 250,
                ready: void 0,
                complete: void 0,
                dismissible: !0,
                starting_top: "4%",
                ending_top: "10%"
            }, h = a(this);
            if (!h.hasClass("open")) {
                var i = d(), j = a('<div class="lean-overlay"></div>');
                lStack = ++b, j.attr("id", i).css("z-index", 1e3 + 2 * lStack), h.data("overlay-id", i).css("z-index", 1e3 + 2 * lStack + 1), h.addClass("open"), a("body").append(j), c = a.extend(g, c), c.dismissible && (j.click(function () {
                    h.closeModal(c)
                }), a(document).on("keyup.leanModal" + i, function (a) {
                    27 === a.keyCode && h.closeModal(c)
                })), h.find(".modal-close").on("click.close", function (a) {
                    h.closeModal(c)
                }), j.css({display: "block", opacity: 0}), h.css({
                    display: "block",
                    opacity: 0
                }), j.velocity({opacity: c.opacity}, {
                    duration: c.in_duration,
                    queue: !1,
                    ease: "easeOutCubic"
                }), h.data("associated-overlay", j[0]), h.hasClass("bottom-sheet") ? h.velocity({
                    bottom: "0",
                    opacity: 1
                }, {
                    duration: c.in_duration, queue: !1, ease: "easeOutCubic", complete: function () {
                        "function" == typeof c.ready && c.ready()
                    }
                }) : (a.Velocity.hook(h, "scaleX", .7), h.css({top: c.starting_top}), h.velocity({
                    top: c.ending_top,
                    opacity: 1,
                    scaleX: "1"
                }, {
                    duration: c.in_duration, queue: !1, ease: "easeOutCubic",
                    complete: function () {
                        "function" == typeof c.ready && c.ready()
                    }
                }))
            }
        }
    }), a.fn.extend({
        closeModal: function (c) {
            var d = {out_duration: 250, complete: void 0}, e = a(this), f = e.data("overlay-id"), g = a("#" + f);
            e.removeClass("open"), c = a.extend(d, c), a("body").css({
                overflow: "",
                width: ""
            }), e.find(".modal-close").off("click.close"), a(document).off("keyup.leanModal" + f), g.velocity({opacity: 0}, {
                duration: c.out_duration,
                queue: !1,
                ease: "easeOutQuart"
            }), e.hasClass("bottom-sheet") ? e.velocity({bottom: "-100%", opacity: 0}, {
                duration: c.out_duration,
                queue: !1,
                ease: "easeOutCubic",
                complete: function () {
                    g.css({display: "none"}), "function" == typeof c.complete && c.complete(), g.remove(), b--
                }
            }) : e.velocity({top: c.starting_top, opacity: 0, scaleX: .7}, {
                duration: c.out_duration,
                complete: function () {
                    a(this).css("display", "none"), "function" == typeof c.complete && c.complete(), g.remove(), b--
                }
            })
        }
    }), a.fn.extend({
        leanModal: function (b) {
            return this.each(function () {
                var c = {starting_top: "4%"}, d = a.extend(c, b);
                a(this).click(function (b) {
                    d.starting_top = (a(this).offset().top - a(window).scrollTop()) / 1.15;
                    var c = a(this).attr("href") || "#" + a(this).data("target");
                    a(c).openModal(d), b.preventDefault()
                })
            })
        }
    })
}(jQuery), function (a) {
    a.fn.materialbox = function () {
        return this.each(function () {
            function b() {
                f = !1;
                var b = i.parent(".material-placeholder"), d = (window.innerWidth, window.innerHeight, i.data("width")), g = i.data("height");
                i.velocity("stop", !0), a("#materialbox-overlay").velocity("stop", !0), a(".materialbox-caption").velocity("stop", !0), a("#materialbox-overlay").velocity({opacity: 0}, {
                    duration: h,
                    queue: !1,
                    easing: "easeOutQuad",
                    complete: function () {
                        e = !1, a(this).remove()
                    }
                }), i.velocity({width: d, height: g, left: 0, top: 0}, {
                    duration: h,
                    queue: !1,
                    easing: "easeOutQuad"
                }), a(".materialbox-caption").velocity({opacity: 0}, {
                    duration: h,
                    queue: !1,
                    easing: "easeOutQuad",
                    complete: function () {
                        b.css({height: "", width: "", position: "", top: "", left: ""}), i.css({
                            height: "",
                            top: "",
                            left: "",
                            width: "",
                            "max-width": "",
                            position: "",
                            "z-index": ""
                        }), i.removeClass("active"), f = !0, a(this).remove(), c && c.css("overflow", "")
                    }
                })
            }

            if (!a(this).hasClass("initialized")) {
                a(this).addClass("initialized");
                var c, d, e = !1, f = !0, g = 275, h = 200, i = a(this), j = a("<div></div>").addClass("material-placeholder");
                i.wrap(j), i.on("click", function () {
                    var h = i.parent(".material-placeholder"), j = window.innerWidth, k = window.innerHeight, l = i.width(), m = i.height();
                    if (f === !1)return b(), !1;
                    if (e && f === !0)return b(), !1;
                    f = !1, i.addClass("active"), e = !0, h.css({
                        width: h[0].getBoundingClientRect().width,
                        height: h[0].getBoundingClientRect().height,
                        position: "relative",
                        top: 0,
                        left: 0
                    }), c = void 0, d = h[0].parentNode;
                    for (; null !== d && !a(d).is(document);) {
                        var n = a(d);
                        "visible" !== n.css("overflow") && (n.css("overflow", "visible"), c = void 0 === c ? n : c.add(n)), d = d.parentNode
                    }
                    i.css({position: "absolute", "z-index": 1e3}).data("width", l).data("height", m);
                    var o = a('<div id="materialbox-overlay"></div>').css({opacity: 0}).click(function () {
                        f === !0 && b()
                    });
                    if (i.before(o), o.velocity({opacity: 1}, {
                            duration: g,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), "" !== i.data("caption")) {
                        var p = a('<div class="materialbox-caption"></div>');
                        p.text(i.data("caption")), a("body").append(p), p.css({display: "inline"}), p.velocity({opacity: 1}, {
                            duration: g,
                            queue: !1,
                            easing: "easeOutQuad"
                        })
                    }
                    var q = 0, r = l / j, s = m / k, t = 0, u = 0;
                    r > s ? (q = m / l, t = .9 * j, u = .9 * j * q) : (q = l / m, t = .9 * k * q, u = .9 * k), i.hasClass("responsive-img") ? i.velocity({
                        "max-width": t,
                        width: l
                    }, {
                        duration: 0, queue: !1, complete: function () {
                            i.css({left: 0, top: 0}).velocity({
                                height: u,
                                width: t,
                                left: a(document).scrollLeft() + j / 2 - i.parent(".material-placeholder").offset().left - t / 2,
                                top: a(document).scrollTop() + k / 2 - i.parent(".material-placeholder").offset().top - u / 2
                            }, {
                                duration: g, queue: !1, easing: "easeOutQuad", complete: function () {
                                    f = !0
                                }
                            })
                        }
                    }) : i.css("left", 0).css("top", 0).velocity({
                        height: u,
                        width: t,
                        left: a(document).scrollLeft() + j / 2 - i.parent(".material-placeholder").offset().left - t / 2,
                        top: a(document).scrollTop() + k / 2 - i.parent(".material-placeholder").offset().top - u / 2
                    }, {
                        duration: g, queue: !1, easing: "easeOutQuad", complete: function () {
                            f = !0
                        }
                    })
                }), a(window).scroll(function () {
                    e && b()
                }), a(document).keyup(function (a) {
                    27 === a.keyCode && f === !0 && e && b()
                })
            }
        })
    }, a(document).ready(function () {
        a(".materialboxed").materialbox()
    })
}(jQuery), function (a) {
    a.fn.parallax = function () {
        var b = a(window).width();
        return this.each(function (c) {
            function d(c) {
                var d;
                d = 601 > b ? e.height() > 0 ? e.height() : e.children("img").height() : e.height() > 0 ? e.height() : 500;
                var f = e.children("img").first(), g = f.height(), h = g - d, i = e.offset().top + d, j = e.offset().top, k = a(window).scrollTop(), l = window.innerHeight, m = k + l, n = (m - j) / (d + l), o = Math.round(h * n);
                c && f.css("display", "block"), i > k && k + l > j && f.css("transform", "translate3D(-50%," + o + "px, 0)")
            }

            var e = a(this);
            e.addClass("parallax"), e.children("img").one("load", function () {
                d(!0)
            }).each(function () {
                this.complete && a(this).load()
            }), a(window).scroll(function () {
                b = a(window).width(), d(!1)
            }), a(window).resize(function () {
                b = a(window).width(), d(!1)
            })
        })
    }
}(jQuery), function (a) {
    var b = {
        init: function (b) {
            var c = {onShow: null};
            return b = a.extend(c, b), this.each(function () {
                var c = a(this);
                a(window).width();
                c.width("100%");
                var d, e, f = c.find("li.tab a"), g = c.width(), h = Math.max(g, c[0].scrollWidth) / f.length, i = 0;
                d = a(f.filter('[href="' + location.hash + '"]')), 0 === d.length && (d = a(this).find("li.tab a.active").first()), 0 === d.length && (d = a(this).find("li.tab a").first()), d.addClass("active"), i = f.index(d), 0 > i && (i = 0), void 0 !== d[0] && (e = a(d[0].hash)), c.append('<div class="indicator"></div>');
                var j = c.find(".indicator");
                c.is(":visible") && (j.css({right: g - (i + 1) * h}), j.css({left: i * h})), a(window).resize(function () {
                    g = c.width(), h = Math.max(g, c[0].scrollWidth) / f.length, 0 > i && (i = 0), 0 !== h && 0 !== g && (j.css({right: g - (i + 1) * h}), j.css({left: i * h}))
                }), f.not(d).each(function () {
                    a(this.hash).hide()
                }), c.on("click", "a", function (k) {
                    if (a(this).parent().hasClass("disabled"))return void k.preventDefault();
                    if (!a(this).attr("target")) {
                        g = c.width(), h = Math.max(g, c[0].scrollWidth) / f.length, d.removeClass("active"), void 0 !== e && e.hide(), d = a(this), e = a(this.hash), f = c.find("li.tab a"), d.addClass("active");
                        var l = i;
                        i = f.index(a(this)), 0 > i && (i = 0), void 0 !== e && (e.show(), "function" == typeof b.onShow && b.onShow.call(this, e)), i - l >= 0 ? (j.velocity({right: g - (i + 1) * h}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), j.velocity({left: i * h}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad",
                            delay: 90
                        })) : (j.velocity({left: i * h}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), j.velocity({right: g - (i + 1) * h}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad",
                            delay: 90
                        })), k.preventDefault()
                    }
                })
            })
        }, select_tab: function (a) {
            this.find('a[href="#' + a + '"]').trigger("click")
        }
    };
    a.fn.tabs = function (c) {
        return b[c] ? b[c].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof c && c ? void a.error("Method " + c + " does not exist on jQuery.tooltip") : b.init.apply(this, arguments)
    }, a(document).ready(function () {
        a("ul.tabs").tabs()
    })
}(jQuery), function (a) {
    a.fn.tooltip = function (c) {
        var d = 5, e = {delay: 350, tooltip: "", position: "bottom", html: !1};
        return "remove" === c ? (this.each(function () {
            a("#" + a(this).attr("data-tooltip-id")).remove(), a(this).off("mouseenter.tooltip mouseleave.tooltip")
        }), !1) : (c = a.extend(e, c), this.each(function () {
            var e = Materialize.guid(), f = a(this);
            f.attr("data-tooltip-id", e);
            var g, h, i, j, k, l, m = function () {
                g = f.attr("data-html") ? "true" === f.attr("data-html") : c.html, h = f.attr("data-delay"), h = void 0 === h || "" === h ? c.delay : h, i = f.attr("data-position"), i = void 0 === i || "" === i ? c.position : i, j = f.attr("data-tooltip"), j = void 0 === j || "" === j ? c.tooltip : j
            };
            m();
            var n = function () {
                var b = a('<div class="material-tooltip"></div>');
                return j = g ? a("<span></span>").html(j) : a("<span></span>").text(j), b.append(j).appendTo(a("body")).attr("id", e), l = a('<div class="backdrop"></div>'), l.appendTo(b), b
            };
            k = n(), f.off("mouseenter.tooltip mouseleave.tooltip");
            var o, p = !1;
            f.on({
                "mouseenter.tooltip": function (a) {
                    var c = function () {
                        m(), p = !0, k.velocity("stop"), l.velocity("stop"), k.css({
                            display: "block",
                            left: "0px",
                            top: "0px"
                        });
                        var a, c, e, g = f.outerWidth(), h = f.outerHeight(), j = k.outerHeight(), n = k.outerWidth(), o = "0px", q = "0px", r = 8, s = 8;
                        "top" === i ? (a = f.offset().top - j - d, c = f.offset().left + g / 2 - n / 2, e = b(c, a, n, j), o = "-10px", l.css({
                            bottom: 0,
                            left: 0,
                            borderRadius: "14px 14px 0 0",
                            transformOrigin: "50% 100%",
                            marginTop: j,
                            marginLeft: n / 2 - l.width() / 2
                        })) : "left" === i ? (a = f.offset().top + h / 2 - j / 2, c = f.offset().left - n - d, e = b(c, a, n, j), q = "-10px", l.css({
                            top: "-7px",
                            right: 0,
                            width: "14px",
                            height: "14px",
                            borderRadius: "14px 0 0 14px",
                            transformOrigin: "95% 50%",
                            marginTop: j / 2,
                            marginLeft: n
                        })) : "right" === i ? (a = f.offset().top + h / 2 - j / 2, c = f.offset().left + g + d, e = b(c, a, n, j), q = "+10px", l.css({
                            top: "-7px",
                            left: 0,
                            width: "14px",
                            height: "14px",
                            borderRadius: "0 14px 14px 0",
                            transformOrigin: "5% 50%",
                            marginTop: j / 2,
                            marginLeft: "0px"
                        })) : (a = f.offset().top + f.outerHeight() + d, c = f.offset().left + g / 2 - n / 2, e = b(c, a, n, j), o = "+10px", l.css({
                            top: 0,
                            left: 0,
                            marginLeft: n / 2 - l.width() / 2
                        })), k.css({
                            top: e.y,
                            left: e.x
                        }), r = Math.SQRT2 * n / parseInt(l.css("width")), s = Math.SQRT2 * j / parseInt(l.css("height")), k.velocity({
                            marginTop: o,
                            marginLeft: q
                        }, {duration: 350, queue: !1}).velocity({opacity: 1}, {
                            duration: 300,
                            delay: 50,
                            queue: !1
                        }), l.css({display: "block"}).velocity({opacity: 1}, {
                            duration: 55,
                            delay: 0,
                            queue: !1
                        }).velocity({scaleX: r, scaleY: s}, {
                            duration: 300,
                            delay: 0,
                            queue: !1,
                            easing: "easeInOutQuad"
                        })
                    };
                    o = setTimeout(c, h)
                }, "mouseleave.tooltip": function () {
                    p = !1, clearTimeout(o), setTimeout(function () {
                        p !== !0 && (k.velocity({opacity: 0, marginTop: 0, marginLeft: 0}, {
                            duration: 225,
                            queue: !1
                        }), l.velocity({opacity: 0, scaleX: 1, scaleY: 1}, {
                            duration: 225,
                            queue: !1,
                            complete: function () {
                                l.css("display", "none"), k.css("display", "none"), p = !1
                            }
                        }))
                    }, 225)
                }
            })
        }))
    };
    var b = function (b, c, d, e) {
        var f = b, g = c;
        return 0 > f ? f = 4 : f + d > window.innerWidth && (f -= f + d - window.innerWidth), 0 > g ? g = 4 : g + e > window.innerHeight + a(window).scrollTop && (g -= g + e - window.innerHeight), {
            x: f,
            y: g
        }
    };
    a(document).ready(function () {
        a(".tooltipped").tooltip()
    })
}(jQuery), function (a) {
    "use strict";
    function b(a) {
        return null !== a && a === a.window
    }

    function c(a) {
        return b(a) ? a : 9 === a.nodeType && a.defaultView
    }

    function d(a) {
        var b, d, e = {top: 0, left: 0}, f = a && a.ownerDocument;
        return b = f.documentElement, "undefined" != typeof a.getBoundingClientRect && (e = a.getBoundingClientRect()), d = c(f), {
            top: e.top + d.pageYOffset - b.clientTop,
            left: e.left + d.pageXOffset - b.clientLeft
        }
    }

    function e(a) {
        var b = "";
        for (var c in a)a.hasOwnProperty(c) && (b += c + ":" + a[c] + ";");
        return b
    }

    function f(a) {
        if (k.allowEvent(a) === !1)return null;
        for (var b = null, c = a.target || a.srcElement; null !== c.parentElement;) {
            if (!(c instanceof SVGElement || -1 === c.className.indexOf("waves-effect"))) {
                b = c;
                break
            }
            if (c.classList.contains("waves-effect")) {
                b = c;
                break
            }
            c = c.parentElement
        }
        return b
    }

    function g(b) {
        var c = f(b);
        null !== c && (j.show(b, c), "ontouchstart" in a && (c.addEventListener("touchend", j.hide, !1), c.addEventListener("touchcancel", j.hide, !1)), c.addEventListener("mouseup", j.hide, !1), c.addEventListener("mouseleave", j.hide, !1))
    }

    var h = h || {}, i = document.querySelectorAll.bind(document), j = {
        duration: 750, show: function (a, b) {
            if (2 === a.button)return !1;
            var c = b || this, f = document.createElement("div");
            f.className = "waves-ripple", c.appendChild(f);
            var g = d(c), h = a.pageY - g.top, i = a.pageX - g.left, k = "scale(" + c.clientWidth / 100 * 10 + ")";
            "touches" in a && (h = a.touches[0].pageY - g.top, i = a.touches[0].pageX - g.left), f.setAttribute("data-hold", Date.now()), f.setAttribute("data-scale", k), f.setAttribute("data-x", i), f.setAttribute("data-y", h);
            var l = {top: h + "px", left: i + "px"};
            f.className = f.className + " waves-notransition", f.setAttribute("style", e(l)), f.className = f.className.replace("waves-notransition", ""), l["-webkit-transform"] = k, l["-moz-transform"] = k, l["-ms-transform"] = k, l["-o-transform"] = k, l.transform = k, l.opacity = "1", l["-webkit-transition-duration"] = j.duration + "ms", l["-moz-transition-duration"] = j.duration + "ms", l["-o-transition-duration"] = j.duration + "ms", l["transition-duration"] = j.duration + "ms", l["-webkit-transition-timing-function"] = "cubic-bezier(0.250, 0.460, 0.450, 0.940)", l["-moz-transition-timing-function"] = "cubic-bezier(0.250, 0.460, 0.450, 0.940)", l["-o-transition-timing-function"] = "cubic-bezier(0.250, 0.460, 0.450, 0.940)", l["transition-timing-function"] = "cubic-bezier(0.250, 0.460, 0.450, 0.940)", f.setAttribute("style", e(l))
        }, hide: function (a) {
            k.touchup(a);
            var b = this, c = (1.4 * b.clientWidth, null), d = b.getElementsByClassName("waves-ripple");
            if (!(d.length > 0))return !1;
            c = d[d.length - 1];
            var f = c.getAttribute("data-x"), g = c.getAttribute("data-y"), h = c.getAttribute("data-scale"), i = Date.now() - Number(c.getAttribute("data-hold")), l = 350 - i;
            0 > l && (l = 0), setTimeout(function () {
                var a = {
                    top: g + "px",
                    left: f + "px",
                    opacity: "0",
                    "-webkit-transition-duration": j.duration + "ms",
                    "-moz-transition-duration": j.duration + "ms",
                    "-o-transition-duration": j.duration + "ms",
                    "transition-duration": j.duration + "ms",
                    "-webkit-transform": h,
                    "-moz-transform": h,
                    "-ms-transform": h,
                    "-o-transform": h,
                    transform: h
                };
                c.setAttribute("style", e(a)), setTimeout(function () {
                    try {
                        b.removeChild(c)
                    } catch (a) {
                        return !1
                    }
                }, j.duration)
            }, l)
        }, wrapInput: function (a) {
            for (var b = 0; b < a.length; b++) {
                var c = a[b];
                if ("input" === c.tagName.toLowerCase()) {
                    var d = c.parentNode;
                    if ("i" === d.tagName.toLowerCase() && -1 !== d.className.indexOf("waves-effect"))continue;
                    var e = document.createElement("i");
                    e.className = c.className + " waves-input-wrapper";
                    var f = c.getAttribute("style");
                    f || (f = ""), e.setAttribute("style", f), c.className = "waves-button-input", c.removeAttribute("style"), d.replaceChild(e, c), e.appendChild(c)
                }
            }
        }
    }, k = {
        touches: 0, allowEvent: function (a) {
            var b = !0;
            return "touchstart" === a.type ? k.touches += 1 : "touchend" === a.type || "touchcancel" === a.type ? setTimeout(function () {
                k.touches > 0 && (k.touches -= 1)
            }, 500) : "mousedown" === a.type && k.touches > 0 && (b = !1), b
        }, touchup: function (a) {
            k.allowEvent(a)
        }
    };
    h.displayEffect = function (b) {
        b = b || {}, "duration" in b && (j.duration = b.duration), j.wrapInput(i(".waves-effect")), "ontouchstart" in a && document.body.addEventListener("touchstart", g, !1), document.body.addEventListener("mousedown", g, !1)
    }, h.attach = function (b) {
        "input" === b.tagName.toLowerCase() && (j.wrapInput([b]), b = b.parentElement), "ontouchstart" in a && b.addEventListener("touchstart", g, !1), b.addEventListener("mousedown", g, !1)
    }, a.Waves = h, document.addEventListener("DOMContentLoaded", function () {
        h.displayEffect()
    }, !1)
}(window), Materialize.toast = function (a, b, c, d) {
    function e(a) {
        var b = document.createElement("div");
        if (b.classList.add("toast"), c)for (var e = c.split(" "), f = 0, g = e.length; g > f; f++)b.classList.add(e[f]);
        ("object" == typeof HTMLElement ? a instanceof HTMLElement : a && "object" == typeof a && null !== a && 1 === a.nodeType && "string" == typeof a.nodeName) ? b.appendChild(a) : a instanceof jQuery ? b.appendChild(a[0]) : b.innerHTML = a;
        var h = new Hammer(b, {prevent_default: !1});
        return h.on("pan", function (a) {
            var c = a.deltaX, d = 80;
            b.classList.contains("panning") || b.classList.add("panning");
            var e = 1 - Math.abs(c / d);
            0 > e && (e = 0), Vel(b, {left: c, opacity: e}, {duration: 50, queue: !1, easing: "easeOutQuad"})
        }), h.on("panend", function (a) {
            var c = a.deltaX, e = 80;
            Math.abs(c) > e ? Vel(b, {marginTop: "-40px"}, {
                duration: 375,
                easing: "easeOutExpo",
                queue: !1,
                complete: function () {
                    "function" == typeof d && d(), b.parentNode.removeChild(b)
                }
            }) : (b.classList.remove("panning"), Vel(b, {left: 0, opacity: 1}, {
                duration: 300,
                easing: "easeOutExpo",
                queue: !1
            }))
        }), b
    }

    c = c || "";
    var f = document.getElementById("toast-container");
    null === f && (f = document.createElement("div"), f.id = "toast-container", document.body.appendChild(f));
    var g = e(a);
    a && f.appendChild(g), g.style.top = "35px", g.style.opacity = 0, Vel(g, {top: "0px", opacity: 1}, {
        duration: 300,
        easing: "easeOutCubic",
        queue: !1
    });
    var h = b, i = setInterval(function () {
        null === g.parentNode && window.clearInterval(i), g.classList.contains("panning") || (h -= 20), 0 >= h && (Vel(g, {
            opacity: 0,
            marginTop: "-40px"
        }, {
            duration: 375, easing: "easeOutExpo", queue: !1, complete: function () {
                "function" == typeof d && d(), this[0].parentNode.removeChild(this[0])
            }
        }), window.clearInterval(i))
    }, 20)
}, function (a) {
    var b = {
        init: function (b) {
            var c = {menuWidth: 300, edge: "left", closeOnClick: !1};
            b = a.extend(c, b), a(this).each(function () {
                function c(c) {
                    g = !1, h = !1, a("body").css({
                        overflow: "",
                        width: ""
                    }), a("#sidenav-overlay").velocity({opacity: 0}, {
                        duration: 200,
                        queue: !1,
                        easing: "easeOutQuad",
                        complete: function () {
                            a(this).remove()
                        }
                    }), "left" === b.edge ? (f.css({
                        width: "",
                        right: "",
                        left: "0"
                    }), e.velocity({translateX: "-100%"}, {
                        duration: 200,
                        queue: !1,
                        easing: "easeOutCubic",
                        complete: function () {
                            c === !0 && (e.removeAttr("style"), e.css("width", b.menuWidth))
                        }
                    })) : (f.css({width: "", right: "0", left: ""}), e.velocity({translateX: "100%"}, {
                        duration: 200,
                        queue: !1,
                        easing: "easeOutCubic",
                        complete: function () {
                            c === !0 && (e.removeAttr("style"), e.css("width", b.menuWidth))
                        }
                    }))
                }

                var d = a(this), e = a("#" + d.attr("data-activates"));
                300 != b.menuWidth && e.css("width", b.menuWidth);
                var f = a('<div class="drag-target"></div>');
                a("body").append(f), "left" == b.edge ? (e.css("transform", "translateX(-100%)"), f.css({left: 0})) : (e.addClass("right-aligned").css("transform", "translateX(100%)"), f.css({right: 0})), e.hasClass("fixed") && window.innerWidth > 992 && e.css("transform", "translateX(0)"), e.hasClass("fixed") && a(window).resize(function () {
                    window.innerWidth > 992 ? 0 !== a("#sidenav-overlay").length && h ? c(!0) : e.css("transform", "translateX(0%)") : h === !1 && ("left" === b.edge ? e.css("transform", "translateX(-100%)") : e.css("transform", "translateX(100%)"))
                }), b.closeOnClick === !0 && e.on("click.itemclick", "a:not(.collapsible-header)", function () {
                    c()
                });
                var g = !1, h = !1;
                f.on("click", function () {
                    h && c()
                }), f.hammer({prevent_default: !1}).bind("pan", function (d) {
                    if ("touch" == d.gesture.pointerType) {
                        var f = (d.gesture.direction, d.gesture.center.x), g = (d.gesture.center.y, d.gesture.velocityX, a("body")), i = g.innerWidth();
                        if (g.css("overflow", "hidden"), g.width(i), 0 === a("#sidenav-overlay").length) {
                            var j = a('<div id="sidenav-overlay"></div>');
                            j.css("opacity", 0).click(function () {
                                c()
                            }), a("body").append(j)
                        }
                        if ("left" === b.edge && (f > b.menuWidth ? f = b.menuWidth : 0 > f && (f = 0)), "left" === b.edge)f < b.menuWidth / 2 ? h = !1 : f >= b.menuWidth / 2 && (h = !0), e.css("transform", "translateX(" + (f - b.menuWidth) + "px)"); else {
                            f < window.innerWidth - b.menuWidth / 2 ? h = !0 : f >= window.innerWidth - b.menuWidth / 2 && (h = !1);
                            var k = f - b.menuWidth / 2;
                            0 > k && (k = 0), e.css("transform", "translateX(" + k + "px)")
                        }
                        var l;
                        "left" === b.edge ? (l = f / b.menuWidth, a("#sidenav-overlay").velocity({opacity: l}, {
                            duration: 10,
                            queue: !1,
                            easing: "easeOutQuad"
                        })) : (l = Math.abs((f - window.innerWidth) / b.menuWidth), a("#sidenav-overlay").velocity({opacity: l}, {
                            duration: 10,
                            queue: !1,
                            easing: "easeOutQuad"
                        }))
                    }
                }).bind("panend", function (c) {
                    if ("touch" == c.gesture.pointerType) {
                        var d = c.gesture.velocityX, i = c.gesture.center.x, j = i - b.menuWidth, k = i - b.menuWidth / 2;
                        j > 0 && (j = 0), 0 > k && (k = 0), g = !1, "left" === b.edge ? h && .3 >= d || -.5 > d ? (0 !== j && e.velocity({translateX: [0, j]}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), a("#sidenav-overlay").velocity({opacity: 1}, {
                            duration: 50,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), f.css({
                            width: "50%",
                            right: 0,
                            left: ""
                        }), h = !0) : (!h || d > .3) && (a("body").css({
                            overflow: "",
                            width: ""
                        }), e.velocity({translateX: [-1 * b.menuWidth - 10, j]}, {
                            duration: 200,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), a("#sidenav-overlay").velocity({opacity: 0}, {
                            duration: 200,
                            queue: !1,
                            easing: "easeOutQuad",
                            complete: function () {
                                a(this).remove()
                            }
                        }), f.css({
                            width: "10px",
                            right: "",
                            left: 0
                        })) : h && d >= -.3 || d > .5 ? (0 !== k && e.velocity({translateX: [0, k]}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), a("#sidenav-overlay").velocity({opacity: 1}, {
                            duration: 50,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), f.css({
                            width: "50%",
                            right: "",
                            left: 0
                        }), h = !0) : (!h || -.3 > d) && (a("body").css({
                            overflow: "",
                            width: ""
                        }), e.velocity({translateX: [b.menuWidth + 10, k]}, {
                            duration: 200,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), a("#sidenav-overlay").velocity({opacity: 0}, {
                            duration: 200,
                            queue: !1,
                            easing: "easeOutQuad",
                            complete: function () {
                                a(this).remove()
                            }
                        }), f.css({width: "10px", right: 0, left: ""}))
                    }
                }), d.click(function () {
                    if (h === !0)h = !1, g = !1, c(); else {
                        var d = a("body"), i = d.innerWidth();
                        d.css("overflow", "hidden"), d.width(i), a("body").append(f), "left" === b.edge ? (f.css({
                            width: "50%",
                            right: 0,
                            left: ""
                        }), e.velocity({translateX: [0, -1 * b.menuWidth]}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        })) : (f.css({
                            width: "50%",
                            right: "",
                            left: 0
                        }), e.velocity({translateX: [0, b.menuWidth]}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        }));
                        var j = a('<div id="sidenav-overlay"></div>');
                        j.css("opacity", 0).click(function () {
                            h = !1, g = !1, c(), j.velocity({opacity: 0}, {
                                duration: 300,
                                queue: !1,
                                easing: "easeOutQuad",
                                complete: function () {
                                    a(this).remove()
                                }
                            })
                        }), a("body").append(j), j.velocity({opacity: 1}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad",
                            complete: function () {
                                h = !0, g = !1
                            }
                        })
                    }
                    return !1
                })
            })
        }, show: function () {
            this.trigger("click")
        }, hide: function () {
            a("#sidenav-overlay").trigger("click")
        }
    };
    a.fn.sideNav = function (c) {
        return b[c] ? b[c].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof c && c ? void a.error("Method " + c + " does not exist on jQuery.sideNav") : b.init.apply(this, arguments)
    }
}(jQuery), function (a) {
    function b(b, c, d, e) {
        var f = a();
        return a.each(g, function (a, g) {
            if (g.height() > 0) {
                var h = g.offset().top, i = g.offset().left, j = i + g.width(), k = h + g.height(), l = !(i > c || e > j || h > d || b > k);
                l && f.push(g)
            }
        }), f
    }

    function c() {
        ++j;
        var c = f.scrollTop(), d = f.scrollLeft(), e = d + f.width(), g = c + f.height(), i = b(c + k.top + 200, e + k.right, g + k.bottom, d + k.left);
        a.each(i, function (a, b) {
            var c = b.data("scrollSpy:ticks");
            "number" != typeof c && b.triggerHandler("scrollSpy:enter"), b.data("scrollSpy:ticks", j)
        }), a.each(h, function (a, b) {
            var c = b.data("scrollSpy:ticks");
            "number" == typeof c && c !== j && (b.triggerHandler("scrollSpy:exit"), b.data("scrollSpy:ticks", null))
        }), h = i
    }

    function d() {
        f.trigger("scrollSpy:winSize")
    }

    function e(a, b, c) {
        var d, e, f, g = null, h = 0;
        c || (c = {});
        var i = function () {
            h = c.leading === !1 ? 0 : l(), g = null, f = a.apply(d, e), d = e = null
        };
        return function () {
            var j = l();
            h || c.leading !== !1 || (h = j);
            var k = b - (j - h);
            return d = this, e = arguments, 0 >= k ? (clearTimeout(g), g = null, h = j, f = a.apply(d, e), d = e = null) : g || c.trailing === !1 || (g = setTimeout(i, k)), f
        }
    }

    var f = a(window), g = [], h = [], i = !1, j = 0, k = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }, l = Date.now || function () {
            return (new Date).getTime()
        };
    a.scrollSpy = function (b, d) {
        var h = {throttle: 100, scrollOffset: 200};
        d = a.extend(h, d);
        var j = [];
        b = a(b), b.each(function (b, c) {
            g.push(a(c)), a(c).data("scrollSpy:id", b), a('a[href="#' + a(c).attr("id") + '"]').click(function (b) {
                b.preventDefault();
                var c = a(this.hash).offset().top + 1;
                a("html, body").animate({scrollTop: c - d.scrollOffset}, {
                    duration: 400,
                    queue: !1,
                    easing: "easeOutCubic"
                })
            })
        }), k.top = d.offsetTop || 0, k.right = d.offsetRight || 0, k.bottom = d.offsetBottom || 0, k.left = d.offsetLeft || 0;
        var l = e(c, d.throttle || 100), m = function () {
            a(document).ready(l)
        };
        return i || (f.on("scroll", m), f.on("resize", m), i = !0), setTimeout(m, 0), b.on("scrollSpy:enter", function () {
            j = a.grep(j, function (a) {
                return 0 != a.height()
            });
            var b = a(this);
            j[0] ? (a('a[href="#' + j[0].attr("id") + '"]').removeClass("active"), b.data("scrollSpy:id") < j[0].data("scrollSpy:id") ? j.unshift(a(this)) : j.push(a(this))) : j.push(a(this)), a('a[href="#' + j[0].attr("id") + '"]').addClass("active")
        }), b.on("scrollSpy:exit", function () {
            if (j = a.grep(j, function (a) {
                    return 0 != a.height()
                }), j[0]) {
                a('a[href="#' + j[0].attr("id") + '"]').removeClass("active");
                var b = a(this);
                j = a.grep(j, function (a) {
                    return a.attr("id") != b.attr("id")
                }), j[0] && a('a[href="#' + j[0].attr("id") + '"]').addClass("active")
            }
        }), b
    }, a.winSizeSpy = function (b) {
        return a.winSizeSpy = function () {
            return f
        }, b = b || {throttle: 100}, f.on("resize", e(d, b.throttle || 100))
    }, a.fn.scrollSpy = function (b) {
        return a.scrollSpy(a(this), b)
    }
}(jQuery), function (a) {
    a(document).ready(function () {
        function b(b) {
            var c = b.css("font-family"), d = b.css("font-size"), f = b.css("line-height");
            d && e.css("font-size", d), c && e.css("font-family", c), f && e.css("line-height", f), "off" === b.attr("wrap") && e.css("overflow-wrap", "normal").css("white-space", "pre"), e.text(b.val() + "\n");
            var g = e.html().replace(/\n/g, "<br>");
            e.html(g), b.is(":visible") ? e.css("width", b.width()) : e.css("width", a(window).width() / 2), b.css("height", e.height())
        }

        Materialize.updateTextFields = function () {
            var b = "input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], textarea";
            a(b).each(function (b, c) {
                a(c).val().length > 0 || c.autofocus || void 0 !== a(this).attr("placeholder") || a(c)[0].validity.badInput === !0 ? a(this).siblings("label").addClass("active") : a(this).siblings("label").removeClass("active")
            })
        };
        var c = "input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], textarea";
        a(document).on("change", c, function () {
            (0 !== a(this).val().length || void 0 !== a(this).attr("placeholder")) && a(this).siblings("label").addClass("active"), validate_field(a(this))
        }), a(document).ready(function () {
            Materialize.updateTextFields()
        }), a(document).on("reset", function (b) {
            var d = a(b.target);
            d.is("form") && (d.find(c).removeClass("valid").removeClass("invalid"), d.find(c).each(function () {
                "" === a(this).attr("value") && a(this).siblings("label").removeClass("active")
            }), d.find("select.initialized").each(function () {
                var a = d.find("option[selected]").text();
                d.siblings("input.select-dropdown").val(a)
            }))
        }), a(document).on("focus", c, function () {
            a(this).siblings("label, .prefix").addClass("active")
        }), a(document).on("blur", c, function () {
            var b = a(this), c = ".prefix";
            0 === b.val().length && b[0].validity.badInput !== !0 && void 0 === b.attr("placeholder") && (c += ", label"), b.siblings(c).removeClass("active"), validate_field(b)
        }), window.validate_field = function (a) {
            var b = void 0 !== a.attr("length"), c = parseInt(a.attr("length")), d = a.val().length;
            0 === a.val().length && a[0].validity.badInput === !1 ? a.hasClass("validate") && (a.removeClass("valid"), a.removeClass("invalid")) : a.hasClass("validate") && (a.is(":valid") && b && c >= d || a.is(":valid") && !b ? (a.removeClass("invalid"), a.addClass("valid")) : (a.removeClass("valid"), a.addClass("invalid")))
        };
        var d = "input[type=radio], input[type=checkbox]";
        a(document).on("keyup.radio", d, function (b) {
            if (9 === b.which) {
                a(this).addClass("tabbed");
                var c = a(this);
                return void c.one("blur", function (b) {
                    a(this).removeClass("tabbed")
                })
            }
        });
        var e = a(".hiddendiv").first();
        e.length || (e = a('<div class="hiddendiv common"></div>'), a("body").append(e));
        var f = ".materialize-textarea";
        a(f).each(function () {
            var c = a(this);
            c.val().length && b(c)
        }), a("body").on("keyup keydown autoresize", f, function () {
            b(a(this))
        }), a(document).on("change", '.file-field input[type="file"]', function () {
            for (var b = a(this).closest(".file-field"), c = b.find("input.file-path"), d = a(this)[0].files, e = [], f = 0; f < d.length; f++)e.push(d[f].name);
            c.val(e.join(", ")), c.trigger("change")
        });
        var g, h = "input[type=range]", i = !1;
        a(h).each(function () {
            var b = a('<span class="thumb"><span class="value"></span></span>');
            a(this).after(b)
        });
        var j = ".range-field";
        a(document).on("change", h, function (b) {
            var c = a(this).siblings(".thumb");
            c.find(".value").html(a(this).val())
        }), a(document).on("input mousedown touchstart", h, function (b) {
            var c = a(this).siblings(".thumb"), d = a(this).outerWidth();
            c.length <= 0 && (c = a('<span class="thumb"><span class="value"></span></span>'), a(this).after(c)), c.find(".value").html(a(this).val()), i = !0, a(this).addClass("active"), c.hasClass("active") || c.velocity({
                height: "30px",
                width: "30px",
                top: "-20px",
                marginLeft: "-15px"
            }, {
                duration: 300,
                easing: "easeOutExpo"
            }), "input" !== b.type && (g = void 0 === b.pageX || null === b.pageX ? b.originalEvent.touches[0].pageX - a(this).offset().left : b.pageX - a(this).offset().left, 0 > g ? g = 0 : g > d && (g = d), c.addClass("active").css("left", g)), c.find(".value").html(a(this).val())
        }), a(document).on("mouseup touchend", j, function () {
            i = !1, a(this).removeClass("active")
        }), a(document).on("mousemove touchmove", j, function (b) {
            var c, d = a(this).children(".thumb");
            if (i) {
                d.hasClass("active") || d.velocity({
                    height: "30px",
                    width: "30px",
                    top: "-20px",
                    marginLeft: "-15px"
                }, {
                    duration: 300,
                    easing: "easeOutExpo"
                }), c = void 0 === b.pageX || null === b.pageX ? b.originalEvent.touches[0].pageX - a(this).offset().left : b.pageX - a(this).offset().left;
                var e = a(this).outerWidth();
                0 > c ? c = 0 : c > e && (c = e), d.addClass("active").css("left", c), d.find(".value").html(d.siblings(h).val())
            }
        }), a(document).on("mouseout touchleave", j, function () {
            if (!i) {
                var b = a(this).children(".thumb");
                b.hasClass("active") && b.velocity({
                    height: "0",
                    width: "0",
                    top: "10px",
                    marginLeft: "-6px"
                }, {duration: 100}), b.removeClass("active")
            }
        }), a.fn.autocomplete = function (b) {
            var c = {data: {}};
            return b = a.extend(c, b), this.each(function () {
                var c = a(this), d = b.data, e = c.closest(".input-field");
                if (!a.isEmptyObject(d)) {
                    var f = a('<ul class="autocomplete-content dropdown-content"></ul>');
                    e.length ? e.append(f) : c.after(f);
                    var g = function (a, b) {
                        var c = b.find("img"), d = b.text().toLowerCase().indexOf("" + a.toLowerCase()), e = d + a.length - 1, f = b.text().slice(0, d), g = b.text().slice(d, e + 1), h = b.text().slice(e + 1);
                        b.html("<span>" + f + "<span class='highlight'>" + g + "</span>" + h + "</span>"), c.length && b.prepend(c)
                    };
                    c.on("keyup", function (b) {
                        if (13 === b.which)return void f.find("li").first().click();
                        var e = c.val().toLowerCase();
                        if (f.empty(), "" !== e)for (var h in d)if (d.hasOwnProperty(h) && -1 !== h.toLowerCase().indexOf(e) && h.toLowerCase() !== e) {
                            var i = a("<li></li>");
                            d[h] ? i.append('<img src="' + d[h] + '" class="right circle"><span>' + h + "</span>") : i.append("<span>" + h + "</span>"), f.append(i), g(e, i)
                        }
                    }), f.on("click", "li", function () {
                        c.val(a(this).text().trim()), f.empty()
                    })
                }
            })
        }
    }), a.fn.material_select = function (b) {
        function c(a, b, c) {
            var e = a.indexOf(b), f = -1 === e;
            return f ? a.push(b) : a.splice(e, 1), c.siblings("ul.dropdown-content").find("li").eq(b).toggleClass("active"), c.find("option").eq(b).prop("selected", f), d(a, c), f
        }

        function d(a, b) {
            for (var c = "", d = 0, e = a.length; e > d; d++) {
                var f = b.find("option").eq(a[d]).text();
                c += 0 === d ? f : ", " + f
            }
            "" === c && (c = b.find("option:disabled").eq(0).text()), b.siblings("input.select-dropdown").val(c)
        }

        a(this).each(function () {
            var d = a(this);
            if (!d.hasClass("browser-default")) {
                var e = d.attr("multiple") ? !0 : !1, f = d.data("select-id");
                if (f && (d.parent().find("span.caret").remove(), d.parent().find("input").remove(), d.unwrap(), a("ul#select-options-" + f).remove()), "destroy" === b)return void d.data("select-id", null).removeClass("initialized");
                var g = Materialize.guid();
                d.data("select-id", g);
                var h = a('<div class="select-wrapper"></div>');
                h.addClass(d.attr("class"));
                var i = a('<ul id="select-options-' + g + '" class="dropdown-content select-dropdown ' + (e ? "multiple-select-dropdown" : "") + '"></ul>'), j = d.children("option, optgroup"), k = [], l = !1, m = d.find("option:selected").html() || d.find("option:first").html() || "", n = function (b, c, d) {
                    var e = c.is(":disabled") ? "disabled " : "", f = "optgroup-option" === d ? "optgroup-option " : "", g = c.data("icon"), h = c.attr("class");
                    if (g) {
                        var j = "";
                        return h && (j = ' class="' + h + '"'), "multiple" === d ? i.append(a('<li class="' + e + '"><img src="' + g + '"' + j + '><span><input type="checkbox"' + e + "/><label></label>" + c.html() + "</span></li>")) : i.append(a('<li class="' + e + f + '"><img src="' + g + '"' + j + "><span>" + c.html() + "</span></li>")), !0
                    }
                    "multiple" === d ? i.append(a('<li class="' + e + '"><span><input type="checkbox"' + e + "/><label></label>" + c.html() + "</span></li>")) : i.append(a('<li class="' + e + f + '"><span>' + c.html() + "</span></li>"))
                };
                j.length && j.each(function () {
                    if (a(this).is("option"))e ? n(d, a(this), "multiple") : n(d, a(this)); else if (a(this).is("optgroup")) {
                        var b = a(this).children("option");
                        i.append(a('<li class="optgroup"><span>' + a(this).attr("label") + "</span></li>")), b.each(function () {
                            n(d, a(this), "optgroup-option")
                        })
                    }
                }), i.find("li:not(.optgroup)").each(function (f) {
                    a(this).click(function (g) {
                        if (!a(this).hasClass("disabled") && !a(this).hasClass("optgroup")) {
                            var h = !0;
                            e ? (a('input[type="checkbox"]', this).prop("checked", function (a, b) {
                                return !b
                            }), h = c(k, a(this).index(), d), q.trigger("focus")) : (i.find("li").removeClass("active"), a(this).toggleClass("active"), q.val(a(this).text())), r(i, a(this)), d.find("option").eq(f).prop("selected", h), d.trigger("change"), "undefined" != typeof b && b()
                        }
                        g.stopPropagation()
                    })
                }), d.wrap(h);
                var o = a('<span class="caret">&#9660;</span>');
                d.is(":disabled") && o.addClass("disabled");
                var p = m.replace(/"/g, "&quot;"), q = a('<input type="text" class="select-dropdown" readonly="true" ' + (d.is(":disabled") ? "disabled" : "") + ' data-activates="select-options-' + g + '" value="' + p + '"/>');
                d.before(q), q.before(o), q.after(i), d.is(":disabled") || q.dropdown({
                    hover: !1,
                    closeOnClick: !1
                }), d.attr("tabindex") && a(q[0]).attr("tabindex", d.attr("tabindex")), d.addClass("initialized"), q.on({
                    focus: function () {
                        if (a("ul.select-dropdown").not(i[0]).is(":visible") && a("input.select-dropdown").trigger("close"), !i.is(":visible")) {
                            a(this).trigger("open", ["focus"]);
                            var b = a(this).val(), c = i.find("li").filter(function () {
                                return a(this).text().toLowerCase() === b.toLowerCase()
                            })[0];
                            r(i, c)
                        }
                    }, click: function (a) {
                        a.stopPropagation()
                    }
                }), q.on("blur", function () {
                    e || a(this).trigger("close"), i.find("li.selected").removeClass("selected")
                }), i.hover(function () {
                    l = !0
                }, function () {
                    l = !1
                }), a(window).on({
                    click: function () {
                        e && (l || q.trigger("close"))
                    }
                }), e && d.find("option:selected:not(:disabled)").each(function () {
                    var b = a(this).index();
                    c(k, b, d), i.find("li").eq(b).find(":checkbox").prop("checked", !0)
                });
                var r = function (b, c) {
                    if (c) {
                        b.find("li.selected").removeClass("selected");
                        var d = a(c);
                        d.addClass("selected"), i.scrollTo(d)
                    }
                }, s = [], t = function (b) {
                    if (9 == b.which)return void q.trigger("close");
                    if (40 == b.which && !i.is(":visible"))return void q.trigger("open");
                    if (13 != b.which || i.is(":visible")) {
                        b.preventDefault();
                        var c = String.fromCharCode(b.which).toLowerCase(), d = [9, 13, 27, 38, 40];
                        if (c && -1 === d.indexOf(b.which)) {
                            s.push(c);
                            var f = s.join(""), g = i.find("li").filter(function () {
                                return 0 === a(this).text().toLowerCase().indexOf(f)
                            })[0];
                            g && r(i, g)
                        }
                        if (13 == b.which) {
                            var h = i.find("li.selected:not(.disabled)")[0];
                            h && (a(h).trigger("click"), e || q.trigger("close"))
                        }
                        40 == b.which && (g = i.find("li.selected").length ? i.find("li.selected").next("li:not(.disabled)")[0] : i.find("li:not(.disabled)")[0], r(i, g)), 27 == b.which && q.trigger("close"), 38 == b.which && (g = i.find("li.selected").prev("li:not(.disabled)")[0], g && r(i, g)), setTimeout(function () {
                            s = []
                        }, 1e3)
                    }
                };
                q.on("keydown", t)
            }
        })
    }
}(jQuery), function (a) {
    var b = {
        init: function (b) {
            var c = {indicators: !0, height: 400, transition: 500, interval: 6e3};
            return b = a.extend(c, b), this.each(function () {
                function c(a, b) {
                    a.hasClass("center-align") ? a.velocity({opacity: 0, translateY: -100}, {
                        duration: b,
                        queue: !1
                    }) : a.hasClass("right-align") ? a.velocity({opacity: 0, translateX: 100}, {
                        duration: b,
                        queue: !1
                    }) : a.hasClass("left-align") && a.velocity({opacity: 0, translateX: -100}, {
                        duration: b,
                        queue: !1
                    })
                }

                function d(a) {
                    a >= j.length ? a = 0 : 0 > a && (a = j.length - 1), k = i.find(".active").index(), k != a && (e = j.eq(k), $caption = e.find(".caption"), e.removeClass("active"), e.velocity({opacity: 0}, {
                        duration: b.transition,
                        queue: !1,
                        easing: "easeOutQuad",
                        complete: function () {
                            j.not(".active").velocity({opacity: 0, translateX: 0, translateY: 0}, {
                                duration: 0,
                                queue: !1
                            })
                        }
                    }), c($caption, b.transition), b.indicators && f.eq(k).removeClass("active"), j.eq(a).velocity({opacity: 1}, {
                        duration: b.transition,
                        queue: !1,
                        easing: "easeOutQuad"
                    }), j.eq(a).find(".caption").velocity({
                        opacity: 1,
                        translateX: 0,
                        translateY: 0
                    }, {
                        duration: b.transition,
                        delay: b.transition,
                        queue: !1,
                        easing: "easeOutQuad"
                    }), j.eq(a).addClass("active"), b.indicators && f.eq(a).addClass("active"))
                }

                var e, f, g, h = a(this), i = h.find("ul.slides").first(), j = i.find("> li"), k = i.find(".active").index();
                -1 != k && (e = j.eq(k)), h.hasClass("fullscreen") || (b.indicators ? h.height(b.height + 40) : h.height(b.height), i.height(b.height)), j.find(".caption").each(function () {
                    c(a(this), 0)
                }), j.find("img").each(function () {
                    var b = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
                    a(this).attr("src") !== b && (a(this).css("background-image", "url(" + a(this).attr("src") + ")"), a(this).attr("src", b))
                }), b.indicators && (f = a('<ul class="indicators"></ul>'), j.each(function (c) {
                    var e = a('<li class="indicator-item"></li>');
                    e.click(function () {
                        var c = i.parent(), e = c.find(a(this)).index();
                        d(e), clearInterval(g), g = setInterval(function () {
                            k = i.find(".active").index(), j.length == k + 1 ? k = 0 : k += 1, d(k)
                        }, b.transition + b.interval)
                    }), f.append(e)
                }), h.append(f), f = h.find("ul.indicators").find("li.indicator-item")), e ? e.show() : (j.first().addClass("active").velocity({opacity: 1}, {
                    duration: b.transition,
                    queue: !1,
                    easing: "easeOutQuad"
                }), k = 0, e = j.eq(k), b.indicators && f.eq(k).addClass("active")), e.find("img").each(function () {
                    e.find(".caption").velocity({opacity: 1, translateX: 0, translateY: 0}, {
                        duration: b.transition,
                        queue: !1,
                        easing: "easeOutQuad"
                    })
                }), g = setInterval(function () {
                    k = i.find(".active").index(), d(k + 1)
                }, b.transition + b.interval);
                var l = !1, m = !1, n = !1;
                h.hammer({prevent_default: !1}).bind("pan", function (a) {
                    if ("touch" === a.gesture.pointerType) {
                        clearInterval(g);
                        var b = a.gesture.direction, c = a.gesture.deltaX, d = a.gesture.velocityX;
                        $curr_slide = i.find(".active"), $curr_slide.velocity({translateX: c}, {
                            duration: 50,
                            queue: !1,
                            easing: "easeOutQuad"
                        }), 4 === b && (c > h.innerWidth() / 2 || -.65 > d) ? n = !0 : 2 === b && (c < -1 * h.innerWidth() / 2 || d > .65) && (m = !0);
                        var e;
                        m && (e = $curr_slide.next(), 0 === e.length && (e = j.first()), e.velocity({opacity: 1}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        })), n && (e = $curr_slide.prev(), 0 === e.length && (e = j.last()), e.velocity({opacity: 1}, {
                            duration: 300,
                            queue: !1,
                            easing: "easeOutQuad"
                        }))
                    }
                }).bind("panend", function (a) {
                    "touch" === a.gesture.pointerType && ($curr_slide = i.find(".active"), l = !1, curr_index = i.find(".active").index(), !n && !m || j.length <= 1 ? $curr_slide.velocity({translateX: 0}, {
                        duration: 300,
                        queue: !1,
                        easing: "easeOutQuad"
                    }) : m ? (d(curr_index + 1), $curr_slide.velocity({translateX: -1 * h.innerWidth()}, {
                        duration: 300,
                        queue: !1,
                        easing: "easeOutQuad",
                        complete: function () {
                            $curr_slide.velocity({opacity: 0, translateX: 0}, {duration: 0, queue: !1})
                        }
                    })) : n && (d(curr_index - 1), $curr_slide.velocity({translateX: h.innerWidth()}, {
                        duration: 300,
                        queue: !1,
                        easing: "easeOutQuad",
                        complete: function () {
                            $curr_slide.velocity({opacity: 0, translateX: 0}, {duration: 0, queue: !1})
                        }
                    })), m = !1, n = !1, clearInterval(g), g = setInterval(function () {
                        k = i.find(".active").index(), j.length == k + 1 ? k = 0 : k += 1, d(k)
                    }, b.transition + b.interval))
                }), h.on("sliderPause", function () {
                    clearInterval(g)
                }), h.on("sliderStart", function () {
                    clearInterval(g), g = setInterval(function () {
                        k = i.find(".active").index(), j.length == k + 1 ? k = 0 : k += 1, d(k)
                    }, b.transition + b.interval)
                }), h.on("sliderNext", function () {
                    k = i.find(".active").index(), d(k + 1)
                }), h.on("sliderPrev", function () {
                    k = i.find(".active").index(), d(k - 1)
                })
            })
        }, pause: function () {
            a(this).trigger("sliderPause")
        }, start: function () {
            a(this).trigger("sliderStart")
        }, next: function () {
            a(this).trigger("sliderNext")
        }, prev: function () {
            a(this).trigger("sliderPrev")
        }
    };
    a.fn.slider = function (c) {
        return b[c] ? b[c].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof c && c ? void a.error("Method " + c + " does not exist on jQuery.tooltip") : b.init.apply(this, arguments)
    }
}(jQuery), function (a) {
    a(document).ready(function () {
        a(document).on("click.card", ".card", function (b) {
            a(this).find("> .card-reveal").length && (a(b.target).is(a(".card-reveal .card-title")) || a(b.target).is(a(".card-reveal .card-title i")) ? a(this).find(".card-reveal").velocity({translateY: 0}, {
                duration: 225,
                queue: !1,
                easing: "easeInOutQuad",
                complete: function () {
                    a(this).css({display: "none"})
                }
            }) : (a(b.target).is(a(".card .activator")) || a(b.target).is(a(".card .activator i"))) && (a(b.target).closest(".card").css("overflow", "hidden"), a(this).find(".card-reveal").css({display: "block"}).velocity("stop", !1).velocity({translateY: "-100%"}, {
                duration: 300,
                queue: !1,
                easing: "easeInOutQuad"
            })))
        })
    })
}(jQuery), function (a) {
    var b = !1, c = {data: [], placeholder: "", secondaryPlaceholder: ""};
    a(document).ready(function () {
        a(document).on("click", ".chip .close", function (b) {
            var c = a(this).closest(".chips");
            c.data("initialized") || a(this).closest(".chip").remove()
        })
    }), a.fn.material_chip = function (d) {
        var e = this;
        return this.$el = a(this), this.$document = a(document), this.SELS = {
            CHIPS: ".chips",
            CHIP: ".chip",
            INPUT: "input",
            DELETE: ".material-icons",
            SELECTED_CHIP: ".selected"
        }, "data" === d ? this.$el.data("chips") : "options" === d ? this.$el.data("options") : (this.$el.data("options", a.extend({}, c, d)), this.init = function () {
            var b = 0;
            e.$el.each(function () {
                var c = a(this);
                if (!c.data("initialized")) {
                    var d = c.data("options");
                    (!d.data || !d.data instanceof Array) && (d.data = []), c.data("chips", d.data), c.data("index", b), c.data("initialized", !0), c.hasClass(e.SELS.CHIPS) || c.addClass("chips"), e.chips(c), b++
                }
            })
        }, this.handleEvents = function () {
            var b = e.SELS;
            e.$document.on("click", b.CHIPS, function (c) {
                a(c.target).find(b.INPUT).focus()
            }), e.$document.on("click", b.CHIP, function (c) {
                a(b.CHIP).removeClass("selected"), a(this).toggleClass("selected")
            }), e.$document.on("keydown", function (c) {
                if (!a(c.target).is("input, textarea")) {
                    var d, f = e.$document.find(b.CHIP + b.SELECTED_CHIP), g = f.closest(b.CHIPS), h = f.siblings(b.CHIP).length;
                    if (f.length)if (8 === c.which || 46 === c.which) {
                        c.preventDefault();
                        var i = g.data("index");
                        d = f.index(), e.deleteChip(i, d, g);
                        var j = null;
                        h > d + 1 ? j = d : (d === h || d + 1 === h) && (j = h - 1), 0 > j && (j = null), null !== j && e.selectChip(i, j, g), h || g.find("input").focus()
                    } else if (37 === c.which) {
                        if (d = f.index() - 1, 0 > d)return;
                        a(b.CHIP).removeClass("selected"), e.selectChip(g.data("index"), d, g)
                    } else if (39 === c.which) {
                        if (d = f.index() + 1, a(b.CHIP).removeClass("selected"), d > h)return void g.find("input").focus();
                        e.selectChip(g.data("index"), d, g)
                    }
                }
            }), e.$document.on("focusin", b.CHIPS + " " + b.INPUT, function (c) {
                a(c.target).closest(b.CHIPS).addClass("focus"), a(b.CHIP).removeClass("selected")
            }), e.$document.on("focusout", b.CHIPS + " " + b.INPUT, function (c) {
                a(c.target).closest(b.CHIPS).removeClass("focus")
            }), e.$document.on("keydown", b.CHIPS + " " + b.INPUT, function (c) {
                var d = a(c.target), f = d.closest(b.CHIPS), g = f.data("index"), h = f.children(b.CHIP).length;
                return 13 === c.which ? (c.preventDefault(), e.addChip(g, {tag: d.val()}, f), void d.val("")) : 8 !== c.keyCode && 37 !== c.keyCode || "" !== d.val() || !h ? void 0 : (e.selectChip(g, h - 1, f), void d.blur())
            }), e.$document.on("click", b.CHIPS + " " + b.DELETE, function (c) {
                var d = a(c.target), f = d.closest(b.CHIPS), g = d.closest(b.CHIP);
                c.stopPropagation(), e.deleteChip(f.data("index"), g.index(), f), f.find("input").focus()
            })
        }, this.chips = function (a) {
            var b = "";
            a.data("options");
            a.data("chips").forEach(function (a) {
                b += e.renderChip(a)
            }), b += '<input class="input" placeholder="">', a.html(b), e.setPlaceholder(a)
        }, this.renderChip = function (a) {
            if (a.tag) {
                var b = '<div class="chip">' + a.tag;
                return a.image && (b += ' <img src="' + a.image + '"> '), b += '<i class="material-icons close">close</i>', b += "</div>"
            }
        }, this.setPlaceholder = function (a) {
            var b = a.data("options");
            a.data("chips").length && b.placeholder ? a.find("input").prop("placeholder", b.placeholder) : !a.data("chips").length && b.secondaryPlaceholder && a.find("input").prop("placeholder", b.secondaryPlaceholder)
        }, this.isValid = function (a, b) {
            for (var c = a.data("chips"), d = !1, e = 0; e < c.length; e++)if (c[e].tag === b.tag)return void(d = !0);
            return "" !== b.tag && !d
        }, this.addChip = function (b, c, d) {
            if (e.isValid(d, c)) {
                var f = (d.data("options"), e.renderChip(c));
                d.data("chips").push(c), a(f).insertBefore(d.find("input")), d.trigger("chip.add", c), e.setPlaceholder(d)
            }
        }, this.deleteChip = function (a, b, c) {
            var d = c.data("chips")[b];
            c.find(".chip").eq(b).remove(), c.data("chips").splice(b, 1), c.trigger("chip.delete", d), e.setPlaceholder(c)
        }, this.selectChip = function (a, b, c) {
            var d = c.find(".chip").eq(b);
            d && !1 === d.hasClass("selected") && (d.addClass("selected"), c.trigger("chip.select", c.data("chips")[b]))
        }, this.getChipsElement = function (a, b) {
            return b.eq(a)
        }, this.init(), void(b || (this.handleEvents(), b = !0)))
    }
}(jQuery), function (a) {
    a.fn.pushpin = function (b) {
        var c = {top: 0, bottom: 1 / 0, offset: 0};
        return "remove" === b ? (this.each(function () {
            (id = a(this).data("pushpin-id")) && (a(window).off("scroll." + id), a(this).removeData("pushpin-id").removeClass("pin-top pinned pin-bottom").removeAttr("style"))
        }), !1) : (b = a.extend(c, b), $index = 0, this.each(function () {
            function c(a) {
                a.removeClass("pin-top"), a.removeClass("pinned"), a.removeClass("pin-bottom")
            }

            function d(d, e) {
                d.each(function () {
                    b.top <= e && b.bottom >= e && !a(this).hasClass("pinned") && (c(a(this)), a(this).css("top", b.offset), a(this).addClass("pinned")), e < b.top && !a(this).hasClass("pin-top") && (c(a(this)), a(this).css("top", 0), a(this).addClass("pin-top")), e > b.bottom && !a(this).hasClass("pin-bottom") && (c(a(this)), a(this).addClass("pin-bottom"), a(this).css("top", b.bottom - g))
                })
            }

            var e = Materialize.guid(), f = a(this), g = a(this).offset().top;
            a(this).data("pushpin-id", e), d(f, a(window).scrollTop()), a(window).on("scroll." + e, function () {
                var c = a(window).scrollTop() + b.offset;
                d(f, c)
            })
        }))
    }
}(jQuery), function (a) {
    a(document).ready(function () {
        a.fn.reverse = [].reverse, a(document).on("mouseenter.fixedActionBtn", ".fixed-action-btn:not(.click-to-toggle)", function (c) {
            var d = a(this);
            b(d)
        }), a(document).on("mouseleave.fixedActionBtn", ".fixed-action-btn:not(.click-to-toggle)", function (b) {
            var d = a(this);
            c(d)
        }), a(document).on("click.fixedActionBtn", ".fixed-action-btn.click-to-toggle > a", function (d) {
            var e = a(this), f = e.parent();
            f.hasClass("active") ? c(f) : b(f)
        })
    }), a.fn.extend({
        openFAB: function () {
            b(a(this))
        }, closeFAB: function () {
            c(a(this))
        }
    });
    var b = function (b) {
        if ($this = b, $this.hasClass("active") === !1) {
            var c, d, e = $this.hasClass("horizontal");
            e === !0 ? d = 40 : c = 40, $this.addClass("active"), $this.find("ul .btn-floating").velocity({
                scaleY: ".4",
                scaleX: ".4",
                translateY: c + "px",
                translateX: d + "px"
            }, {duration: 0});
            var f = 0;
            $this.find("ul .btn-floating").reverse().each(function () {
                a(this).velocity({
                    opacity: "1",
                    scaleX: "1",
                    scaleY: "1",
                    translateY: "0",
                    translateX: "0"
                }, {duration: 80, delay: f}), f += 40
            })
        }
    }, c = function (a) {
        $this = a;
        var b, c, d = $this.hasClass("horizontal");
        d === !0 ? c = 40 : b = 40, $this.removeClass("active");
        $this.find("ul .btn-floating").velocity("stop", !0), $this.find("ul .btn-floating").velocity({
            opacity: "0",
            scaleX: ".4",
            scaleY: ".4",
            translateY: b + "px",
            translateX: c + "px"
        }, {duration: 80})
    }
}(jQuery), function (a) {
    Materialize.fadeInImage = function (b) {
        var c;
        if ("string" == typeof b)c = a(b); else {
            if ("object" != typeof b)return;
            c = b
        }
        c.css({opacity: 0}), a(c).velocity({opacity: 1}, {
            duration: 650,
            queue: !1,
            easing: "easeOutSine"
        }), a(c).velocity({opacity: 1}, {
            duration: 1300, queue: !1, easing: "swing", step: function (b, c) {
                c.start = 100;
                var d = b / 100, e = 150 - (100 - b) / 1.75;
                100 > e && (e = 100), b >= 0 && a(this).css({
                    "-webkit-filter": "grayscale(" + d + ")brightness(" + e + "%)",
                    filter: "grayscale(" + d + ")brightness(" + e + "%)"
                })
            }
        })
    }, Materialize.showStaggeredList = function (b) {
        var c;
        if ("string" == typeof b)c = a(b); else {
            if ("object" != typeof b)return;
            c = b
        }
        var d = 0;
        c.find("li").velocity({translateX: "-100px"}, {duration: 0}), c.find("li").each(function () {
            a(this).velocity({opacity: "1", translateX: "0"}, {duration: 800, delay: d, easing: [60, 10]}), d += 120
        })
    }, a(document).ready(function () {
        var b = !1, c = !1;
        a(".dismissable").each(function () {
            a(this).hammer({prevent_default: !1}).bind("pan", function (d) {
                if ("touch" === d.gesture.pointerType) {
                    var e = a(this), f = d.gesture.direction, g = d.gesture.deltaX, h = d.gesture.velocityX;
                    e.velocity({translateX: g}, {
                        duration: 50,
                        queue: !1,
                        easing: "easeOutQuad"
                    }), 4 === f && (g > e.innerWidth() / 2 || -.75 > h) && (b = !0), 2 === f && (g < -1 * e.innerWidth() / 2 || h > .75) && (c = !0)
                }
            }).bind("panend", function (d) {
                if (Math.abs(d.gesture.deltaX) < a(this).innerWidth() / 2 && (c = !1, b = !1), "touch" === d.gesture.pointerType) {
                    var e = a(this);
                    if (b || c) {
                        var f;
                        f = b ? e.innerWidth() : -1 * e.innerWidth(), e.velocity({translateX: f}, {
                            duration: 100,
                            queue: !1,
                            easing: "easeOutQuad",
                            complete: function () {
                                e.css("border", "none"), e.velocity({height: 0, padding: 0}, {
                                    duration: 200,
                                    queue: !1,
                                    easing: "easeOutQuad",
                                    complete: function () {
                                        e.remove()
                                    }
                                })
                            }
                        })
                    } else e.velocity({translateX: 0}, {duration: 100, queue: !1, easing: "easeOutQuad"});
                    b = !1, c = !1
                }
            })
        })
    })
}(jQuery), function (a) {
    Materialize.scrollFire = function (a) {
        var b = !1;
        window.addEventListener("scroll", function () {
            b = !0
        }), setInterval(function () {
            if (b) {
                b = !1;
                for (var c = window.pageYOffset + window.innerHeight, d = 0; d < a.length; d++) {
                    var e = a[d], f = e.selector, g = e.offset, h = e.callback, i = document.querySelector(f);
                    if (null !== i) {
                        var j = i.getBoundingClientRect().top + window.pageYOffset;
                        if (c > j + g && e.done !== !0) {
                            if ("function" == typeof h)h.call(this, i); else if ("string" == typeof h) {
                                var k = new Function(h);
                                k(i)
                            }
                            e.done = !0
                        }
                    }
                }
            }
        }, 100)
    }
}(jQuery), function (a) {
    "function" == typeof define && define.amd ? define("picker", ["jquery"], a) : "object" == typeof exports ? module.exports = a(require("jquery")) : this.Picker = a(jQuery)
}(function (a) {
    function b(f, g, i, l) {
        function m() {
            return b._.node("div", b._.node("div", b._.node("div", b._.node("div", y.component.nodes(t.open), v.box), v.wrap), v.frame), v.holder)
        }

        function n() {
            w.data(g, y).addClass(v.input).attr("tabindex", -1).val(w.data("value") ? y.get("select", u.format) : f.value), u.editable || w.on("focus." + t.id + " click." + t.id, function (a) {
                a.preventDefault(), y.$root.eq(0).focus()
            }).on("keydown." + t.id, q), e(f, {haspopup: !0, expanded: !1, readonly: !1, owns: f.id + "_root"})
        }

        function o() {
            y.$root.on({
                keydown: q, focusin: function (a) {
                    y.$root.removeClass(v.focused), a.stopPropagation()
                }, "mousedown click": function (b) {
                    var c = b.target;
                    c != y.$root.children()[0] && (b.stopPropagation(), "mousedown" != b.type || a(c).is("input, select, textarea, button, option") || (b.preventDefault(), y.$root.eq(0).focus()))
                }
            }).on({
                focus: function () {
                    w.addClass(v.target)
                }, blur: function () {
                    w.removeClass(v.target)
                }
            }).on("focus.toOpen", r).on("click", "[data-pick], [data-nav], [data-clear], [data-close]", function () {
                var b = a(this), c = b.data(), d = b.hasClass(v.navDisabled) || b.hasClass(v.disabled), e = h();
                e = e && (e.type || e.href), (d || e && !a.contains(y.$root[0], e)) && y.$root.eq(0).focus(), !d && c.nav ? y.set("highlight", y.component.item.highlight, {nav: c.nav}) : !d && "pick" in c ? y.set("select", c.pick) : c.clear ? y.clear().close(!0) : c.close && y.close(!0)
            }), e(y.$root[0], "hidden", !0)
        }

        function p() {
            var b;
            u.hiddenName === !0 ? (b = f.name, f.name = "") : (b = ["string" == typeof u.hiddenPrefix ? u.hiddenPrefix : "", "string" == typeof u.hiddenSuffix ? u.hiddenSuffix : "_submit"], b = b[0] + f.name + b[1]), y._hidden = a('<input type=hidden name="' + b + '"' + (w.data("value") || f.value ? ' value="' + y.get("select", u.formatSubmit) + '"' : "") + ">")[0], w.on("change." + t.id, function () {
                y._hidden.value = f.value ? y.get("select", u.formatSubmit) : ""
            }), u.container ? a(u.container).append(y._hidden) : w.after(y._hidden)
        }

        function q(a) {
            var b = a.keyCode, c = /^(8|46)$/.test(b);
            return 27 == b ? (y.close(), !1) : void((32 == b || c || !t.open && y.component.key[b]) && (a.preventDefault(), a.stopPropagation(), c ? y.clear().close() : y.open()))
        }

        function r(a) {
            a.stopPropagation(), "focus" == a.type && y.$root.addClass(v.focused), y.open()
        }

        if (!f)return b;
        var s = !1, t = {id: f.id || "P" + Math.abs(~~(Math.random() * new Date))}, u = i ? a.extend(!0, {}, i.defaults, l) : l || {}, v = a.extend({}, b.klasses(), u.klass), w = a(f), x = function () {
            return this.start()
        }, y = x.prototype = {
            constructor: x, $node: w, start: function () {
                return t && t.start ? y : (t.methods = {}, t.start = !0, t.open = !1, t.type = f.type, f.autofocus = f == h(), f.readOnly = !u.editable, f.id = f.id || t.id, "text" != f.type && (f.type = "text"), y.component = new i(y, u), y.$root = a(b._.node("div", m(), v.picker, 'id="' + f.id + '_root" tabindex="0"')), o(), u.formatSubmit && p(), n(), u.container ? a(u.container).append(y.$root) : w.after(y.$root), y.on({
                    start: y.component.onStart,
                    render: y.component.onRender,
                    stop: y.component.onStop,
                    open: y.component.onOpen,
                    close: y.component.onClose,
                    set: y.component.onSet
                }).on({
                    start: u.onStart,
                    render: u.onRender,
                    stop: u.onStop,
                    open: u.onOpen,
                    close: u.onClose,
                    set: u.onSet
                }), s = c(y.$root.children()[0]), f.autofocus && y.open(), y.trigger("start").trigger("render"))
            }, render: function (a) {
                return a ? y.$root.html(m()) : y.$root.find("." + v.box).html(y.component.nodes(t.open)), y.trigger("render")
            }, stop: function () {
                return t.start ? (y.close(), y._hidden && y._hidden.parentNode.removeChild(y._hidden), y.$root.remove(), w.removeClass(v.input).removeData(g), setTimeout(function () {
                    w.off("." + t.id)
                }, 0), f.type = t.type, f.readOnly = !1, y.trigger("stop"), t.methods = {}, t.start = !1, y) : y
            }, open: function (c) {
                return t.open ? y : (w.addClass(v.active), e(f, "expanded", !0), setTimeout(function () {
                    y.$root.addClass(v.opened), e(y.$root[0], "hidden", !1)
                }, 0), c !== !1 && (t.open = !0, s && k.css("overflow", "hidden").css("padding-right", "+=" + d()), y.$root.eq(0).focus(), j.on("click." + t.id + " focusin." + t.id, function (a) {
                    var b = a.target;
                    b != f && b != document && 3 != a.which && y.close(b === y.$root.children()[0])
                }).on("keydown." + t.id, function (c) {
                    var d = c.keyCode, e = y.component.key[d], f = c.target;
                    27 == d ? y.close(!0) : f != y.$root[0] || !e && 13 != d ? a.contains(y.$root[0], f) && 13 == d && (c.preventDefault(), f.click()) : (c.preventDefault(), e ? b._.trigger(y.component.key.go, y, [b._.trigger(e)]) : y.$root.find("." + v.highlighted).hasClass(v.disabled) || y.set("select", y.component.item.highlight).close())
                })), y.trigger("open"))
            }, close: function (a) {
                return a && (y.$root.off("focus.toOpen").eq(0).focus(), setTimeout(function () {
                    y.$root.on("focus.toOpen", r)
                }, 0)), w.removeClass(v.active), e(f, "expanded", !1), setTimeout(function () {
                    y.$root.removeClass(v.opened + " " + v.focused), e(y.$root[0], "hidden", !0)
                }, 0), t.open ? (t.open = !1, s && k.css("overflow", "").css("padding-right", "-=" + d()), j.off("." + t.id), y.trigger("close")) : y
            }, clear: function (a) {
                return y.set("clear", null, a)
            }, set: function (b, c, d) {
                var e, f, g = a.isPlainObject(b), h = g ? b : {};
                if (d = g && a.isPlainObject(c) ? c : d || {}, b) {
                    g || (h[b] = c);
                    for (e in h)f = h[e], e in y.component.item && (void 0 === f && (f = null), y.component.set(e, f, d)), ("select" == e || "clear" == e) && w.val("clear" == e ? "" : y.get(e, u.format)).trigger("change");
                    y.render()
                }
                return d.muted ? y : y.trigger("set", h)
            }, get: function (a, c) {
                if (a = a || "value", null != t[a])return t[a];
                if ("valueSubmit" == a) {
                    if (y._hidden)return y._hidden.value;
                    a = "value"
                }
                if ("value" == a)return f.value;
                if (a in y.component.item) {
                    if ("string" == typeof c) {
                        var d = y.component.get(a);
                        return d ? b._.trigger(y.component.formats.toString, y.component, [c, d]) : ""
                    }
                    return y.component.get(a)
                }
            }, on: function (b, c, d) {
                var e, f, g = a.isPlainObject(b), h = g ? b : {};
                if (b) {
                    g || (h[b] = c);
                    for (e in h)f = h[e], d && (e = "_" + e), t.methods[e] = t.methods[e] || [], t.methods[e].push(f)
                }
                return y
            }, off: function () {
                var a, b, c = arguments;
                for (a = 0, namesCount = c.length; a < namesCount; a += 1)b = c[a], b in t.methods && delete t.methods[b];
                return y
            }, trigger: function (a, c) {
                var d = function (a) {
                    var d = t.methods[a];
                    d && d.map(function (a) {
                        b._.trigger(a, y, [c])
                    })
                };
                return d("_" + a), d(a), y
            }
        };
        return new x
    }

    function c(a) {
        var b, c = "position";
        return a.currentStyle ? b = a.currentStyle[c] : window.getComputedStyle && (b = getComputedStyle(a)[c]), "fixed" == b
    }

    function d() {
        if (k.height() <= i.height())return 0;
        var b = a('<div style="visibility:hidden;width:100px" />').appendTo("body"), c = b[0].offsetWidth;
        b.css("overflow", "scroll");
        var d = a('<div style="width:100%" />').appendTo(b), e = d[0].offsetWidth;
        return b.remove(), c - e
    }

    function e(b, c, d) {
        if (a.isPlainObject(c))for (var e in c)f(b, e, c[e]); else f(b, c, d)
    }

    function f(a, b, c) {
        a.setAttribute(("role" == b ? "" : "aria-") + b, c)
    }

    function g(b, c) {
        a.isPlainObject(b) || (b = {attribute: c}), c = "";
        for (var d in b) {
            var e = ("role" == d ? "" : "aria-") + d, f = b[d];
            c += null == f ? "" : e + '="' + b[d] + '"'
        }
        return c
    }

    function h() {
        try {
            return document.activeElement
        } catch (a) {
        }
    }

    var i = a(window), j = a(document), k = a(document.documentElement);
    return b.klasses = function (a) {
        return a = a || "picker", {
            picker: a,
            opened: a + "--opened",
            focused: a + "--focused",
            input: a + "__input",
            active: a + "__input--active",
            target: a + "__input--target",
            holder: a + "__holder",
            frame: a + "__frame",
            wrap: a + "__wrap",
            box: a + "__box"
        }
    }, b._ = {
        group: function (a) {
            for (var c, d = "", e = b._.trigger(a.min, a); e <= b._.trigger(a.max, a, [e]); e += a.i)c = b._.trigger(a.item, a, [e]), d += b._.node(a.node, c[0], c[1], c[2]);
            return d
        }, node: function (b, c, d, e) {
            return c ? (c = a.isArray(c) ? c.join("") : c, d = d ? ' class="' + d + '"' : "", e = e ? " " + e : "", "<" + b + d + e + ">" + c + "</" + b + ">") : ""
        }, lead: function (a) {
            return (10 > a ? "0" : "") + a
        }, trigger: function (a, b, c) {
            return "function" == typeof a ? a.apply(b, c || []) : a
        }, digits: function (a) {
            return /\d/.test(a[1]) ? 2 : 1
        }, isDate: function (a) {
            return {}.toString.call(a).indexOf("Date") > -1 && this.isInteger(a.getDate())
        }, isInteger: function (a) {
            return {}.toString.call(a).indexOf("Number") > -1 && a % 1 === 0
        }, ariaAttr: g
    }, b.extend = function (c, d) {
        a.fn[c] = function (e, f) {
            var g = this.data(c);
            return "picker" == e ? g : g && "string" == typeof e ? b._.trigger(g[e], g, [f]) : this.each(function () {
                var f = a(this);
                f.data(c) || new b(this, c, d, e)
            })
        }, a.fn[c].defaults = d.defaults
    }, b
}), function (a) {
    "function" == typeof define && define.amd ? define(["picker", "jquery"], a) : "object" == typeof exports ? module.exports = a(require("./picker.js"), require("jquery")) : a(Picker, jQuery)
}(function (a, b) {
    function c(a, b) {
        var c = this, d = a.$node[0], e = d.value, f = a.$node.data("value"), g = f || e, h = f ? b.formatSubmit : b.format, i = function () {
            return d.currentStyle ? "rtl" == d.currentStyle.direction : "rtl" == getComputedStyle(a.$root[0]).direction
        };
        c.settings = b, c.$node = a.$node, c.queue = {
            min: "measure create",
            max: "measure create",
            now: "now create",
            select: "parse create validate",
            highlight: "parse navigate create validate",
            view: "parse create validate viewset",
            disable: "deactivate",
            enable: "activate"
        }, c.item = {}, c.item.clear = null, c.item.disable = (b.disable || []).slice(0), c.item.enable = -function (a) {
            return a[0] === !0 ? a.shift() : -1
        }(c.item.disable), c.set("min", b.min).set("max", b.max).set("now"), g ? c.set("select", g, {format: h}) : c.set("select", null).set("highlight", c.item.now), c.key = {
            40: 7,
            38: -7,
            39: function () {
                return i() ? -1 : 1
            },
            37: function () {
                return i() ? 1 : -1
            },
            go: function (a) {
                var b = c.item.highlight, d = new Date(b.year, b.month, b.date + a);
                c.set("highlight", d, {interval: a}), this.render()
            }
        }, a.on("render", function () {
            a.$root.find("." + b.klass.selectMonth).on("change", function () {
                var c = this.value;
                c && (a.set("highlight", [a.get("view").year, c, a.get("highlight").date]), a.$root.find("." + b.klass.selectMonth).trigger("focus"))
            }), a.$root.find("." + b.klass.selectYear).on("change", function () {
                var c = this.value;
                c && (a.set("highlight", [c, a.get("view").month, a.get("highlight").date]), a.$root.find("." + b.klass.selectYear).trigger("focus"))
            })
        }, 1).on("open", function () {
            var d = "";
            c.disabled(c.get("now")) && (d = ":not(." + b.klass.buttonToday + ")"), a.$root.find("button" + d + ", select").attr("disabled", !1)
        }, 1).on("close", function () {
            a.$root.find("button, select").attr("disabled", !0)
        }, 1)
    }

    var d = 7, e = 6, f = a._;
    c.prototype.set = function (a, b, c) {
        var d = this, e = d.item;
        return null === b ? ("clear" == a && (a = "select"), e[a] = b, d) : (e["enable" == a ? "disable" : "flip" == a ? "enable" : a] = d.queue[a].split(" ").map(function (e) {
            return b = d[e](a, b, c)
        }).pop(), "select" == a ? d.set("highlight", e.select, c) : "highlight" == a ? d.set("view", e.highlight, c) : a.match(/^(flip|min|max|disable|enable)$/) && (e.select && d.disabled(e.select) && d.set("select", e.select, c), e.highlight && d.disabled(e.highlight) && d.set("highlight", e.highlight, c)), d)
    }, c.prototype.get = function (a) {
        return this.item[a]
    }, c.prototype.create = function (a, c, d) {
        var e, g = this;
        return c = void 0 === c ? a : c, c == -(1 / 0) || c == 1 / 0 ? e = c : b.isPlainObject(c) && f.isInteger(c.pick) ? c = c.obj : b.isArray(c) ? (c = new Date(c[0], c[1], c[2]), c = f.isDate(c) ? c : g.create().obj) : c = f.isInteger(c) || f.isDate(c) ? g.normalize(new Date(c), d) : g.now(a, c, d), {
            year: e || c.getFullYear(),
            month: e || c.getMonth(),
            date: e || c.getDate(),
            day: e || c.getDay(),
            obj: e || c,
            pick: e || c.getTime()
        }
    }, c.prototype.createRange = function (a, c) {
        var d = this, e = function (a) {
            return a === !0 || b.isArray(a) || f.isDate(a) ? d.create(a) : a
        };
        return f.isInteger(a) || (a = e(a)), f.isInteger(c) || (c = e(c)), f.isInteger(a) && b.isPlainObject(c) ? a = [c.year, c.month, c.date + a] : f.isInteger(c) && b.isPlainObject(a) && (c = [a.year, a.month, a.date + c]), {
            from: e(a),
            to: e(c)
        }
    }, c.prototype.withinRange = function (a, b) {
        return a = this.createRange(a.from, a.to), b.pick >= a.from.pick && b.pick <= a.to.pick
    }, c.prototype.overlapRanges = function (a, b) {
        var c = this;
        return a = c.createRange(a.from, a.to), b = c.createRange(b.from, b.to), c.withinRange(a, b.from) || c.withinRange(a, b.to) || c.withinRange(b, a.from) || c.withinRange(b, a.to)
    }, c.prototype.now = function (a, b, c) {
        return b = new Date, c && c.rel && b.setDate(b.getDate() + c.rel), this.normalize(b, c)
    }, c.prototype.navigate = function (a, c, d) {
        var e, f, g, h, i = b.isArray(c), j = b.isPlainObject(c), k = this.item.view;
        if (i || j) {
            for (j ? (f = c.year, g = c.month, h = c.date) : (f = +c[0], g = +c[1], h = +c[2]), d && d.nav && k && k.month !== g && (f = k.year, g = k.month), e = new Date(f, g + (d && d.nav ? d.nav : 0), 1), f = e.getFullYear(), g = e.getMonth(); new Date(f, g, h).getMonth() !== g;)h -= 1;
            c = [f, g, h]
        }
        return c
    }, c.prototype.normalize = function (a) {
        return a.setHours(0, 0, 0, 0), a
    }, c.prototype.measure = function (a, b) {
        var c = this;
        return b ? "string" == typeof b ? b = c.parse(a, b) : f.isInteger(b) && (b = c.now(a, b, {rel: b})) : b = "min" == a ? -(1 / 0) : 1 / 0, b
    }, c.prototype.viewset = function (a, b) {
        return this.create([b.year, b.month, 1])
    }, c.prototype.validate = function (a, c, d) {
        var e, g, h, i, j = this, k = c, l = d && d.interval ? d.interval : 1, m = -1 === j.item.enable, n = j.item.min, o = j.item.max, p = m && j.item.disable.filter(function (a) {
                if (b.isArray(a)) {
                    var d = j.create(a).pick;
                    d < c.pick ? e = !0 : d > c.pick && (g = !0)
                }
                return f.isInteger(a)
            }).length;
        if ((!d || !d.nav) && (!m && j.disabled(c) || m && j.disabled(c) && (p || e || g) || !m && (c.pick <= n.pick || c.pick >= o.pick)))for (m && !p && (!g && l > 0 || !e && 0 > l) && (l *= -1); j.disabled(c) && (Math.abs(l) > 1 && (c.month < k.month || c.month > k.month) && (c = k, l = l > 0 ? 1 : -1), c.pick <= n.pick ? (h = !0, l = 1, c = j.create([n.year, n.month, n.date + (c.pick === n.pick ? 0 : -1)])) : c.pick >= o.pick && (i = !0, l = -1, c = j.create([o.year, o.month, o.date + (c.pick === o.pick ? 0 : 1)])), !h || !i);)c = j.create([c.year, c.month, c.date + l]);
        return c
    }, c.prototype.disabled = function (a) {
        var c = this, d = c.item.disable.filter(function (d) {
            return f.isInteger(d) ? a.day === (c.settings.firstDay ? d : d - 1) % 7 : b.isArray(d) || f.isDate(d) ? a.pick === c.create(d).pick : b.isPlainObject(d) ? c.withinRange(d, a) : void 0
        });
        return d = d.length && !d.filter(function (a) {
                return b.isArray(a) && "inverted" == a[3] || b.isPlainObject(a) && a.inverted
            }).length, -1 === c.item.enable ? !d : d || a.pick < c.item.min.pick || a.pick > c.item.max.pick
    }, c.prototype.parse = function (a, b, c) {
        var d = this, e = {};
        return b && "string" == typeof b ? (c && c.format || (c = c || {}, c.format = d.settings.format), d.formats.toArray(c.format).map(function (a) {
            var c = d.formats[a], g = c ? f.trigger(c, d, [b, e]) : a.replace(/^!/, "").length;
            c && (e[a] = b.substr(0, g)), b = b.substr(g)
        }), [e.yyyy || e.yy, +(e.mm || e.m) - 1, e.dd || e.d]) : b
    }, c.prototype.formats = function () {
        function a(a, b, c) {
            var d = a.match(/\w+/)[0];
            return c.mm || c.m || (c.m = b.indexOf(d) + 1), d.length
        }

        function b(a) {
            return a.match(/\w+/)[0].length
        }

        return {
            d: function (a, b) {
                return a ? f.digits(a) : b.date
            }, dd: function (a, b) {
                return a ? 2 : f.lead(b.date)
            }, ddd: function (a, c) {
                return a ? b(a) : this.settings.weekdaysShort[c.day]
            }, dddd: function (a, c) {
                return a ? b(a) : this.settings.weekdaysFull[c.day]
            }, m: function (a, b) {
                return a ? f.digits(a) : b.month + 1
            }, mm: function (a, b) {
                return a ? 2 : f.lead(b.month + 1)
            }, mmm: function (b, c) {
                var d = this.settings.monthsShort;
                return b ? a(b, d, c) : d[c.month]
            }, mmmm: function (b, c) {
                var d = this.settings.monthsFull;
                return b ? a(b, d, c) : d[c.month]
            }, yy: function (a, b) {
                return a ? 2 : ("" + b.year).slice(2)
            }, yyyy: function (a, b) {
                return a ? 4 : b.year
            }, toArray: function (a) {
                return a.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g)
            }, toString: function (a, b) {
                var c = this;
                return c.formats.toArray(a).map(function (a) {
                    return f.trigger(c.formats[a], c, [0, b]) || a.replace(/^!/, "")
                }).join("")
            }
        }
    }(), c.prototype.isDateExact = function (a, c) {
        var d = this;
        return f.isInteger(a) && f.isInteger(c) || "boolean" == typeof a && "boolean" == typeof c ? a === c : (f.isDate(a) || b.isArray(a)) && (f.isDate(c) || b.isArray(c)) ? d.create(a).pick === d.create(c).pick : b.isPlainObject(a) && b.isPlainObject(c) ? d.isDateExact(a.from, c.from) && d.isDateExact(a.to, c.to) : !1
    }, c.prototype.isDateOverlap = function (a, c) {
        var d = this, e = d.settings.firstDay ? 1 : 0;
        return f.isInteger(a) && (f.isDate(c) || b.isArray(c)) ? (a = a % 7 + e, a === d.create(c).day + 1) : f.isInteger(c) && (f.isDate(a) || b.isArray(a)) ? (c = c % 7 + e, c === d.create(a).day + 1) : b.isPlainObject(a) && b.isPlainObject(c) ? d.overlapRanges(a, c) : !1
    }, c.prototype.flipEnable = function (a) {
        var b = this.item;
        b.enable = a || (-1 == b.enable ? 1 : -1)
    }, c.prototype.deactivate = function (a, c) {
        var d = this, e = d.item.disable.slice(0);
        return "flip" == c ? d.flipEnable() : c === !1 ? (d.flipEnable(1), e = []) : c === !0 ? (d.flipEnable(-1), e = []) : c.map(function (a) {
            for (var c, g = 0; g < e.length; g += 1)if (d.isDateExact(a, e[g])) {
                c = !0;
                break
            }
            c || (f.isInteger(a) || f.isDate(a) || b.isArray(a) || b.isPlainObject(a) && a.from && a.to) && e.push(a)
        }), e
    }, c.prototype.activate = function (a, c) {
        var d = this, e = d.item.disable, g = e.length;
        return "flip" == c ? d.flipEnable() : c === !0 ? (d.flipEnable(1), e = []) : c === !1 ? (d.flipEnable(-1), e = []) : c.map(function (a) {
            var c, h, i, j;
            for (i = 0; g > i; i += 1) {
                if (h = e[i], d.isDateExact(h, a)) {
                    c = e[i] = null, j = !0;
                    break
                }
                if (d.isDateOverlap(h, a)) {
                    b.isPlainObject(a) ? (a.inverted = !0, c = a) : b.isArray(a) ? (c = a, c[3] || c.push("inverted")) : f.isDate(a) && (c = [a.getFullYear(), a.getMonth(), a.getDate(), "inverted"]);
                    break
                }
            }
            if (c)for (i = 0; g > i; i += 1)if (d.isDateExact(e[i], a)) {
                e[i] = null;
                break
            }
            if (j)for (i = 0; g > i; i += 1)if (d.isDateOverlap(e[i], a)) {
                e[i] = null;
                break
            }
            c && e.push(c)
        }), e.filter(function (a) {
            return null != a
        })
    }, c.prototype.nodes = function (a) {
        var b = this, c = b.settings, g = b.item, h = g.now, i = g.select, j = g.highlight, k = g.view, l = g.disable, m = g.min, n = g.max, o = function (a, b) {
            return c.firstDay && (a.push(a.shift()), b.push(b.shift())), f.node("thead", f.node("tr", f.group({
                min: 0,
                max: d - 1,
                i: 1,
                node: "th",
                item: function (d) {
                    return [a[d], c.klass.weekdays, 'scope=col title="' + b[d] + '"']
                }
            })))
        }((c.showWeekdaysFull ? c.weekdaysFull : c.weekdaysLetter).slice(0), c.weekdaysFull.slice(0)), p = function (a) {
            return f.node("div", " ", c.klass["nav" + (a ? "Next" : "Prev")] + (a && k.year >= n.year && k.month >= n.month || !a && k.year <= m.year && k.month <= m.month ? " " + c.klass.navDisabled : ""), "data-nav=" + (a || -1) + " " + f.ariaAttr({
                    role: "button",
                    controls: b.$node[0].id + "_table"
                }) + ' title="' + (a ? c.labelMonthNext : c.labelMonthPrev) + '"')
        }, q = function (d) {
            var e = c.showMonthsShort ? c.monthsShort : c.monthsFull;
            return "short_months" == d && (e = c.monthsShort), c.selectMonths && void 0 == d ? f.node("select", f.group({
                min: 0,
                max: 11,
                i: 1,
                node: "option",
                item: function (a) {
                    return [e[a], 0, "value=" + a + (k.month == a ? " selected" : "") + (k.year == m.year && a < m.month || k.year == n.year && a > n.month ? " disabled" : "")]
                }
            }), c.klass.selectMonth + " browser-default", (a ? "" : "disabled") + " " + f.ariaAttr({
                    controls: b.$node[0].id + "_table"
                }) + ' title="' + c.labelMonthSelect + '"') : "short_months" == d ? null != i ? f.node("div", e[i.month]) : f.node("div", e[k.month]) : f.node("div", e[k.month], c.klass.month)
        }, r = function (d) {
            var e = k.year, g = c.selectYears === !0 ? 5 : ~~(c.selectYears / 2);
            if (g) {
                var h = m.year, i = n.year, j = e - g, l = e + g;
                if (h > j && (l += h - j, j = h), l > i) {
                    var o = j - h, p = l - i;
                    j -= o > p ? p : o, l = i
                }
                if (c.selectYears && void 0 == d)return f.node("select", f.group({
                    min: j,
                    max: l,
                    i: 1,
                    node: "option",
                    item: function (a) {
                        return [a, 0, "value=" + a + (e == a ? " selected" : "")]
                    }
                }), c.klass.selectYear + " browser-default", (a ? "" : "disabled") + " " + f.ariaAttr({controls: b.$node[0].id + "_table"}) + ' title="' + c.labelYearSelect + '"')
            }
            return "raw" == d ? f.node("div", e) : f.node("div", e, c.klass.year)
        };
        return createDayLabel = function () {
            return null != i ? f.node("div", i.date) : f.node("div", h.date)
        }, createWeekdayLabel = function () {
            var a;
            a = null != i ? i.day : h.day;
            var b = c.weekdaysFull[a];
            return b
        }, f.node("div", f.node("div", createWeekdayLabel(), "picker__weekday-display") + f.node("div", q("short_months"), c.klass.month_display) + f.node("div", createDayLabel(), c.klass.day_display) + f.node("div", r("raw"), c.klass.year_display), c.klass.date_display) + f.node("div", f.node("div", (c.selectYears ? q() + r() : q() + r()) + p() + p(1), c.klass.header) + f.node("table", o + f.node("tbody", f.group({
                    min: 0,
                    max: e - 1,
                    i: 1,
                    node: "tr",
                    item: function (a) {
                        var e = c.firstDay && 0 === b.create([k.year, k.month, 1]).day ? -7 : 0;
                        return [f.group({
                            min: d * a - k.day + e + 1, max: function () {
                                return this.min + d - 1
                            }, i: 1, node: "td", item: function (a) {
                                a = b.create([k.year, k.month, a + (c.firstDay ? 1 : 0)]);
                                var d = i && i.pick == a.pick, e = j && j.pick == a.pick, g = l && b.disabled(a) || a.pick < m.pick || a.pick > n.pick, o = f.trigger(b.formats.toString, b, [c.format, a]);
                                return [f.node("div", a.date, function (b) {
                                    return b.push(k.month == a.month ? c.klass.infocus : c.klass.outfocus), h.pick == a.pick && b.push(c.klass.now), d && b.push(c.klass.selected), e && b.push(c.klass.highlighted), g && b.push(c.klass.disabled), b.join(" ")
                                }([c.klass.day]), "data-pick=" + a.pick + " " + f.ariaAttr({
                                        role: "gridcell",
                                        label: o,
                                        selected: d && b.$node.val() === o ? !0 : null,
                                        activedescendant: e ? !0 : null,
                                        disabled: g ? !0 : null
                                    })), "", f.ariaAttr({role: "presentation"})]
                            }
                        })]
                    }
                })), c.klass.table, 'id="' + b.$node[0].id + '_table" ' + f.ariaAttr({
                    role: "grid",
                    controls: b.$node[0].id,
                    readonly: !0
                })), c.klass.calendar_container) + f.node("div", f.node("button", c.today, "btn-flat picker__today", "type=button data-pick=" + h.pick + (a && !b.disabled(h) ? "" : " disabled") + " " + f.ariaAttr({controls: b.$node[0].id})) + f.node("button", c.clear, "btn-flat picker__clear", "type=button data-clear=1" + (a ? "" : " disabled") + " " + f.ariaAttr({controls: b.$node[0].id})) + f.node("button", c.close, "btn-flat picker__close", "type=button data-close=true " + (a ? "" : " disabled") + " " + f.ariaAttr({controls: b.$node[0].id})), c.klass.footer)
    }, c.defaults = function (a) {
        return {
            labelMonthNext: "Next month",
            labelMonthPrev: "Previous month",
            labelMonthSelect: "Select a month",
            labelYearSelect: "Select a year",
            monthsFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            weekdaysFull: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            weekdaysLetter: ["S", "M", "T", "W", "T", "F", "S"],
            today: "Today",
            clear: "Clear",
            close: "Close",
            format: "d mmmm, yyyy",
            klass: {
                table: a + "table",
                header: a + "header",
                date_display: a + "date-display",
                day_display: a + "day-display",
                month_display: a + "month-display",
                year_display: a + "year-display",
                calendar_container: a + "calendar-container",
                navPrev: a + "nav--prev",
                navNext: a + "nav--next",
                navDisabled: a + "nav--disabled",
                month: a + "month",
                year: a + "year",
                selectMonth: a + "select--month",
                selectYear: a + "select--year",
                weekdays: a + "weekday",
                day: a + "day",
                disabled: a + "day--disabled",
                selected: a + "day--selected",
                highlighted: a + "day--highlighted",
                now: a + "day--today",
                infocus: a + "day--infocus",
                outfocus: a + "day--outfocus",
                footer: a + "footer",
                buttonClear: a + "button--clear",
                buttonToday: a + "button--today",
                buttonClose: a + "button--close"
            }
        }
    }(a.klasses().picker + "__"), a.extend("pickadate", c)
}), function (a) {
    function b() {
        var b = +a(this).attr("length"), c = +a(this).val().length, d = b >= c;
        a(this).parent().find('span[class="character-counter"]').html(c + "/" + b), e(d, a(this))
    }

    function c(b) {
        var c = b.parent().find('span[class="character-counter"]');
        c.length || (c = a("<span/>").addClass("character-counter").css("float", "right").css("font-size", "12px").css("height", 1), b.parent().append(c))
    }

    function d() {
        a(this).parent().find('span[class="character-counter"]').html("")
    }

    function e(a, b) {
        var c = b.hasClass("invalid");
        a && c ? b.removeClass("invalid") : a || c || (b.removeClass("valid"), b.addClass("invalid"))
    }

    a.fn.characterCounter = function () {
        return this.each(function () {
            var e = a(this), f = e.parent().find('span[class="character-counter"]');
            if (!f.length) {
                var g = void 0 !== e.attr("length");
                g && (e.on("input", b), e.on("focus", b), e.on("blur", d), c(e))
            }
        })
    }, a(document).ready(function () {
        a("input, textarea").characterCounter()
    })
}(jQuery), function (a) {
    var b = {
        init: function (b) {
            var c = {time_constant: 200, dist: -100, shift: 0, padding: 0, full_width: !1, indicators: !1, no_wrap: !1};
            return b = a.extend(c, b), this.each(function () {
                function c() {
                    "undefined" != typeof window.ontouchstart && (H[0].addEventListener("touchstart", l), H[0].addEventListener("touchmove", m), H[0].addEventListener("touchend", n)), H[0].addEventListener("mousedown", l), H[0].addEventListener("mousemove", m), H[0].addEventListener("mouseup", n), H[0].addEventListener("mouseleave", n), H[0].addEventListener("click", j)
                }

                function d(a) {
                    return a.targetTouches && a.targetTouches.length >= 1 ? a.targetTouches[0].clientX : a.clientX
                }

                function e(a) {
                    return a.targetTouches && a.targetTouches.length >= 1 ? a.targetTouches[0].clientY : a.clientY
                }

                function f(a) {
                    return a >= t ? a % t : 0 > a ? f(t + a % t) : a
                }

                function g(a) {
                    var c, d, e, g, h, i, j;
                    if (p = "number" == typeof a ? a : p, q = Math.floor((p + s / 2) / s), e = p - q * s, g = 0 > e ? 1 : -1, h = -g * e * 2 / s, d = t >> 1, b.full_width ? j = "translateX(0)" : (j = "translateX(" + (H[0].clientWidth - item_width) / 2 + "px) ", j += "translateY(" + (H[0].clientHeight - item_width) / 2 + "px)"), I) {
                        var k = q % t, l = G.find(".indicator-item.active");
                        l.index() !== k && (l.removeClass("active"), G.find(".indicator-item").eq(k).addClass("active"))
                    }
                    for ((!b.no_wrap || q >= 0 && t > q) && (i = o[f(q)], i.style[A] = j + " translateX(" + -e / 2 + "px) translateX(" + g * b.shift * h * c + "px) translateZ(" + b.dist * h + "px)", i.style.zIndex = 0, b.full_width ? tweenedOpacity = 1 : tweenedOpacity = 1 - .2 * h, i.style.opacity = tweenedOpacity, i.style.display = "block"), c = 1; d >= c; ++c)b.full_width ? (zTranslation = b.dist, tweenedOpacity = c === d && 0 > e ? 1 - h : 1) : (zTranslation = b.dist * (2 * c + h * g), tweenedOpacity = 1 - .2 * (2 * c + h * g)), (!b.no_wrap || t > q + c) && (i = o[f(q + c)], i.style[A] = j + " translateX(" + (b.shift + (s * c - e) / 2) + "px) translateZ(" + zTranslation + "px)", i.style.zIndex = -c, i.style.opacity = tweenedOpacity, i.style.display = "block"), b.full_width ? (zTranslation = b.dist, tweenedOpacity = c === d && e > 0 ? 1 - h : 1) : (zTranslation = b.dist * (2 * c - h * g), tweenedOpacity = 1 - .2 * (2 * c - h * g)), (!b.no_wrap || q - c >= 0) && (i = o[f(q - c)], i.style[A] = j + " translateX(" + (-b.shift + (-s * c - e) / 2) + "px) translateZ(" + zTranslation + "px)", i.style.zIndex = -c, i.style.opacity = tweenedOpacity, i.style.display = "block");
                    (!b.no_wrap || q >= 0 && t > q) && (i = o[f(q)], i.style[A] = j + " translateX(" + -e / 2 + "px) translateX(" + g * b.shift * h + "px) translateZ(" + b.dist * h + "px)", i.style.zIndex = 0, b.full_width ? tweenedOpacity = 1 : tweenedOpacity = 1 - .2 * h, i.style.opacity = tweenedOpacity, i.style.display = "block")
                }

                function h() {
                    var a, b, c, d;
                    a = Date.now(), b = a - C, C = a, c = p - B, B = p, d = 1e3 * c / (1 + b), z = .8 * d + .2 * z
                }

                function i() {
                    var a, c;
                    w && (a = Date.now() - C, c = w * Math.exp(-a / b.time_constant), c > 2 || -2 > c ? (g(x - c), requestAnimationFrame(i)) : g(x))
                }

                function j(c) {
                    if (E)return c.preventDefault(), c.stopPropagation(), !1;
                    if (!b.full_width) {
                        var d = a(c.target).closest(".carousel-item").index(), e = q % t - d;
                        0 !== e && (c.preventDefault(), c.stopPropagation()), k(d)
                    }
                }

                function k(a) {
                    var c = q % t - a;
                    b.no_wrap || (0 > c ? Math.abs(c + t) < Math.abs(c) && (c += t) : c > 0 && Math.abs(c - t) < c && (c -= t)), 0 > c ? H.trigger("carouselNext", [Math.abs(c)]) : c > 0 && H.trigger("carouselPrev", [c])
                }

                function l(a) {
                    r = !0, E = !1, F = !1, u = d(a), v = e(a), z = w = 0, B = p, C = Date.now(), clearInterval(D), D = setInterval(h, 100)
                }

                function m(a) {
                    var b, c, f;
                    if (r)if (b = d(a), y = e(a), c = u - b, f = Math.abs(v - y), 30 > f && !F)(c > 2 || -2 > c) && (E = !0, u = b, g(p + c)); else {
                        if (E)return a.preventDefault(), a.stopPropagation(), !1;
                        F = !0
                    }
                    return E ? (a.preventDefault(), a.stopPropagation(), !1) : void 0
                }

                function n(a) {
                    return r ? (r = !1, clearInterval(D), x = p, (z > 10 || -10 > z) && (w = .9 * z, x = p + w), x = Math.round(x / s) * s, b.no_wrap && (x >= s * (t - 1) ? x = s * (t - 1) : 0 > x && (x = 0)), w = x - p, C = Date.now(), requestAnimationFrame(i), E && (a.preventDefault(), a.stopPropagation()), !1) : void 0
                }

                var o, p, q, r, s, t, u, v, w, x, z, A, B, C, D, E, F, G = a('<ul class="indicators"></ul>'), H = a(this), I = H.attr("data-indicators") || b.indicators;
                if (H.hasClass("initialized"))return a(this).trigger("carouselNext", [1e-6]), !0;
                if (b.full_width) {
                    b.dist = 0;
                    var J = H.find(".carousel-item img").first();
                    J.length ? imageHeight = J.load(function () {
                        H.css("height", a(this).height())
                    }) : (imageHeight = H.find(".carousel-item").first().height(), H.css("height", imageHeight)), I && H.find(".carousel-fixed-item").addClass("with-indicators")
                }
                H.addClass("initialized"), r = !1, p = x = 0, o = [], item_width = H.find(".carousel-item").first().innerWidth(), s = 2 * item_width + b.padding, H.find(".carousel-item").each(function (b) {
                    if (o.push(a(this)[0]), I) {
                        var c = a('<li class="indicator-item"></li>');
                        0 === b && c.addClass("active"), c.click(function () {
                            var b = a(this).index();
                            k(b)
                        }), G.append(c)
                    }
                }), I && H.append(G), t = o.length, A = "transform", ["webkit", "Moz", "O", "ms"].every(function (a) {
                    var b = a + "Transform";
                    return "undefined" != typeof document.body.style[b] ? (A = b, !1) : !0
                }), window.onresize = g, c(), g(p), a(this).on("carouselNext", function (a, b) {
                    void 0 === b && (b = 1), x = p + s * b, p !== x && (w = x - p, C = Date.now(), requestAnimationFrame(i))
                }), a(this).on("carouselPrev", function (a, b) {
                    void 0 === b && (b = 1), x = p - s * b, p !== x && (w = x - p, C = Date.now(), requestAnimationFrame(i))
                }), a(this).on("carouselSet", function (a, b) {
                    void 0 === b && (b = 0), k(b)
                })
            })
        }, next: function (b) {
            a(this).trigger("carouselNext", [b])
        }, prev: function (b) {
            a(this).trigger("carouselPrev", [b])
        }, set: function (b) {
            a(this).trigger("carouselSet", [b])
        }
    };
    a.fn.carousel = function (c) {
        return b[c] ? b[c].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof c && c ? void a.error("Method " + c + " does not exist on jQuery.carousel") : b.init.apply(this, arguments)
    }
}(jQuery);


/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.8
 *
 */
(function (e) {
    e.fn.extend({
        slimScroll: function (f) {
            var a = e.extend({
                width: "auto",
                height: "250px",
                size: "7px",
                color: "#000",
                position: "right",
                distance: "1px",
                start: "top",
                opacity: .4,
                alwaysVisible: !1,
                disableFadeOut: !1,
                railVisible: !1,
                railColor: "#333",
                railOpacity: .2,
                railDraggable: !0,
                railClass: "slimScrollRail",
                barClass: "slimScrollBar",
                wrapperClass: "slimScrollDiv",
                allowPageScroll: !1,
                wheelStep: 20,
                touchScrollStep: 200,
                borderRadius: "7px",
                railBorderRadius: "7px"
            }, f);
            this.each(function () {
                function v(d) {
                    if (r) {
                        d = d || window.event;
                        var c = 0;
                        d.wheelDelta && (c = -d.wheelDelta / 120);
                        d.detail && (c = d.detail / 3);
                        e(d.target || d.srcTarget || d.srcElement).closest("." + a.wrapperClass).is(b.parent()) && n(c, !0);
                        d.preventDefault && !k && d.preventDefault();
                        k || (d.returnValue = !1)
                    }
                }

                function n(d, g, e) {
                    k = !1;
                    var f = b.outerHeight() - c.outerHeight();
                    g && (g = parseInt(c.css("top")) + d * parseInt(a.wheelStep) / 100 * c.outerHeight(), g = Math.min(Math.max(g, 0), f), g = 0 < d ? Math.ceil(g) : Math.floor(g), c.css({top: g + "px"}));
                    l = parseInt(c.css("top")) / (b.outerHeight() - c.outerHeight());
                    g =
                        l * (b[0].scrollHeight - b.outerHeight());
                    e && (g = d, d = g / b[0].scrollHeight * b.outerHeight(), d = Math.min(Math.max(d, 0), f), c.css({top: d + "px"}));
                    b.scrollTop(g);
                    b.trigger("slimscrolling", ~~g);
                    w();
                    p()
                }

                function x() {
                    u = Math.max(b.outerHeight() / b[0].scrollHeight * b.outerHeight(), 30);
                    c.css({height: u + "px"});
                    var a = u == b.outerHeight() ? "none" : "block";
                    c.css({display: a})
                }

                function w() {
                    x();
                    clearTimeout(B);
                    l == ~~l ? (k = a.allowPageScroll, C != l && b.trigger("slimscroll", 0 == ~~l ? "top" : "bottom")) : k = !1;
                    C = l;
                    u >= b.outerHeight() ? k = !0 : (c.stop(!0,
                        !0).fadeIn("fast"), a.railVisible && m.stop(!0, !0).fadeIn("fast"))
                }

                function p() {
                    a.alwaysVisible || (B = setTimeout(function () {
                        a.disableFadeOut && r || y || z || (c.fadeOut("slow"), m.fadeOut("slow"))
                    }, 1E3))
                }

                var r, y, z, B, A, u, l, C, k = !1, b = e(this);
                if (b.parent().hasClass(a.wrapperClass)) {
                    var q = b.scrollTop(), c = b.siblings("." + a.barClass), m = b.siblings("." + a.railClass);
                    x();
                    if (e.isPlainObject(f)) {
                        if ("height" in f && "auto" == f.height) {
                            b.parent().css("height", "auto");
                            b.css("height", "auto");
                            var h = b.parent().parent().height();
                            b.parent().css("height",
                                h);
                            b.css("height", h)
                        } else"height" in f && (h = f.height, b.parent().css("height", h), b.css("height", h));
                        if ("scrollTo" in f)q = parseInt(a.scrollTo); else if ("scrollBy" in f)q += parseInt(a.scrollBy); else if ("destroy" in f) {
                            c.remove();
                            m.remove();
                            b.unwrap();
                            return
                        }
                        n(q, !1, !0)
                    }
                } else if (!(e.isPlainObject(f) && "destroy" in f)) {
                    a.height = "auto" == a.height ? b.parent().height() : a.height;
                    q = e("<div></div>").addClass(a.wrapperClass).css({
                        position: "relative",
                        overflow: "hidden",
                        width: a.width,
                        height: a.height
                    });
                    b.css({
                        overflow: "hidden",
                        width: a.width, height: a.height
                    });
                    var m = e("<div></div>").addClass(a.railClass).css({
                        width: a.size,
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        display: a.alwaysVisible && a.railVisible ? "block" : "none",
                        "border-radius": a.railBorderRadius,
                        background: a.railColor,
                        opacity: a.railOpacity,
                        zIndex: 90
                    }), c = e("<div></div>").addClass(a.barClass).css({
                        background: a.color,
                        width: a.size,
                        position: "absolute",
                        top: 0,
                        opacity: a.opacity,
                        display: a.alwaysVisible ? "block" : "none",
                        "border-radius": a.borderRadius,
                        BorderRadius: a.borderRadius,
                        MozBorderRadius: a.borderRadius,
                        WebkitBorderRadius: a.borderRadius,
                        zIndex: 99
                    }), h = "right" == a.position ? {right: a.distance} : {left: a.distance};
                    m.css(h);
                    c.css(h);
                    b.wrap(q);
                    b.parent().append(c);
                    b.parent().append(m);
                    a.railDraggable && c.bind("mousedown", function (a) {
                        var b = e(document);
                        z = !0;
                        t = parseFloat(c.css("top"));
                        pageY = a.pageY;
                        b.bind("mousemove.slimscroll", function (a) {
                            currTop = t + a.pageY - pageY;
                            c.css("top", currTop);
                            n(0, c.position().top, !1)
                        });
                        b.bind("mouseup.slimscroll", function (a) {
                            z = !1;
                            p();
                            b.unbind(".slimscroll")
                        });
                        return !1
                    }).bind("selectstart.slimscroll",
                        function (a) {
                            a.stopPropagation();
                            a.preventDefault();
                            return !1
                        });
                    m.hover(function () {
                        w()
                    }, function () {
                        p()
                    });
                    c.hover(function () {
                        y = !0
                    }, function () {
                        y = !1
                    });
                    b.hover(function () {
                        r = !0;
                        w();
                        p()
                    }, function () {
                        r = !1;
                        p()
                    });
                    b.bind("touchstart", function (a, b) {
                        a.originalEvent.touches.length && (A = a.originalEvent.touches[0].pageY)
                    });
                    b.bind("touchmove", function (b) {
                        k || b.originalEvent.preventDefault();
                        b.originalEvent.touches.length && (n((A - b.originalEvent.touches[0].pageY) / a.touchScrollStep, !0), A = b.originalEvent.touches[0].pageY)
                    });
                    x();
                    "bottom" === a.start ? (c.css({top: b.outerHeight() - c.outerHeight()}), n(0, !0)) : "top" !== a.start && (n(e(a.start).position().top, null, !0), a.alwaysVisible || c.hide());
                    window.addEventListener ? (this.addEventListener("DOMMouseScroll", v, !1), this.addEventListener("mousewheel", v, !1)) : document.attachEvent("onmousewheel", v)
                }
            });
            return this
        }
    });
    e.fn.extend({slimscroll: e.fn.slimScroll})
})(jQuery);


/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

/*!
 * Generated using the Bootstrap Customizer (http://getbootstrap.com/customize/?id=eed5247f9a2b3a41aa96a61f270b888d)
 * Config saved to config.json and https://gist.github.com/eed5247f9a2b3a41aa96a61f270b888d
 */
if (typeof jQuery === 'undefined') {
    throw new Error('Bootstrap\'s JavaScript requires jQuery')
}
+function ($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.')
    if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
        throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
    }
}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.7
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // ALERT CLASS DEFINITION
    // ======================

    var dismiss = '[data-dismiss="alert"]'
    var Alert = function (el) {
        $(el).on('click', dismiss, this.close)
    }

    Alert.VERSION = '3.3.7'

    Alert.TRANSITION_DURATION = 150

    Alert.prototype.close = function (e) {
        var $this = $(this)
        var selector = $this.attr('data-target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        var $parent = $(selector === '#' ? [] : selector)

        if (e) e.preventDefault()

        if (!$parent.length) {
            $parent = $this.closest('.alert')
        }

        $parent.trigger(e = $.Event('close.bs.alert'))

        if (e.isDefaultPrevented()) return

        $parent.removeClass('in')

        function removeElement() {
            // detach from parent, fire event then clean up data
            $parent.detach().trigger('closed.bs.alert').remove()
        }

        $.support.transition && $parent.hasClass('fade') ?
            $parent
                .one('bsTransitionEnd', removeElement)
                .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
            removeElement()
    }


    // ALERT PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.alert')

            if (!data) $this.data('bs.alert', (data = new Alert(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.alert

    $.fn.alert = Plugin
    $.fn.alert.Constructor = Alert


    // ALERT NO CONFLICT
    // =================

    $.fn.alert.noConflict = function () {
        $.fn.alert = old
        return this
    }


    // ALERT DATA-API
    // ==============

    $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.7
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // BUTTON PUBLIC CLASS DEFINITION
    // ==============================

    var Button = function (element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Button.DEFAULTS, options)
        this.isLoading = false
    }

    Button.VERSION = '3.3.7'

    Button.DEFAULTS = {
        loadingText: 'loading...'
    }

    Button.prototype.setState = function (state) {
        var d = 'disabled'
        var $el = this.$element
        var val = $el.is('input') ? 'val' : 'html'
        var data = $el.data()

        state += 'Text'

        if (data.resetText == null) $el.data('resetText', $el[val]())

        // push to event loop to allow forms to submit
        setTimeout($.proxy(function () {
            $el[val](data[state] == null ? this.options[state] : data[state])

            if (state == 'loadingText') {
                this.isLoading = true
                $el.addClass(d).attr(d, d).prop(d, true)
            } else if (this.isLoading) {
                this.isLoading = false
                $el.removeClass(d).removeAttr(d).prop(d, false)
            }
        }, this), 0)
    }

    Button.prototype.toggle = function () {
        var changed = true
        var $parent = this.$element.closest('[data-toggle="buttons"]')

        if ($parent.length) {
            var $input = this.$element.find('input')
            if ($input.prop('type') == 'radio') {
                if ($input.prop('checked')) changed = false
                $parent.find('.active').removeClass('active')
                this.$element.addClass('active')
            } else if ($input.prop('type') == 'checkbox') {
                if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
                this.$element.toggleClass('active')
            }
            $input.prop('checked', this.$element.hasClass('active'))
            if (changed) $input.trigger('change')
        } else {
            this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
            this.$element.toggleClass('active')
        }
    }


    // BUTTON PLUGIN DEFINITION
    // ========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.button')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.button', (data = new Button(this, options)))

            if (option == 'toggle') data.toggle()
            else if (option) data.setState(option)
        })
    }

    var old = $.fn.button

    $.fn.button = Plugin
    $.fn.button.Constructor = Button


    // BUTTON NO CONFLICT
    // ==================

    $.fn.button.noConflict = function () {
        $.fn.button = old
        return this
    }


    // BUTTON DATA-API
    // ===============

    $(document)
        .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
            var $btn = $(e.target).closest('.btn')
            Plugin.call($btn, 'toggle')
            if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
                // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
                e.preventDefault()
                // The target component still receive the focus
                if ($btn.is('input,button')) $btn.trigger('focus')
                else $btn.find('input:visible,button:visible').first().trigger('focus')
            }
        })
        .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
            $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
        })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element)
        this.$indicators = this.$element.find('.carousel-indicators')
        this.options = options
        this.paused = null
        this.sliding = null
        this.interval = null
        this.$active = null
        this.$items = null

        this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

        this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
            .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
            .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
    }

    Carousel.VERSION = '3.3.7'

    Carousel.TRANSITION_DURATION = 600

    Carousel.DEFAULTS = {
        interval: 5000,
        pause: 'hover',
        wrap: true,
        keyboard: true
    }

    Carousel.prototype.keydown = function (e) {
        if (/input|textarea/i.test(e.target.tagName)) return
        switch (e.which) {
            case 37:
                this.prev();
                break
            case 39:
                this.next();
                break
            default:
                return
        }

        e.preventDefault()
    }

    Carousel.prototype.cycle = function (e) {
        e || (this.paused = false)

        this.interval && clearInterval(this.interval)

        this.options.interval
        && !this.paused
        && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

        return this
    }

    Carousel.prototype.getItemIndex = function (item) {
        this.$items = item.parent().children('.item')
        return this.$items.index(item || this.$active)
    }

    Carousel.prototype.getItemForDirection = function (direction, active) {
        var activeIndex = this.getItemIndex(active)
        var willWrap = (direction == 'prev' && activeIndex === 0)
            || (direction == 'next' && activeIndex == (this.$items.length - 1))
        if (willWrap && !this.options.wrap) return active
        var delta = direction == 'prev' ? -1 : 1
        var itemIndex = (activeIndex + delta) % this.$items.length
        return this.$items.eq(itemIndex)
    }

    Carousel.prototype.to = function (pos) {
        var that = this
        var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

        if (pos > (this.$items.length - 1) || pos < 0) return

        if (this.sliding)       return this.$element.one('slid.bs.carousel', function () {
            that.to(pos)
        }) // yes, "slid"
        if (activeIndex == pos) return this.pause().cycle()

        return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
    }

    Carousel.prototype.pause = function (e) {
        e || (this.paused = true)

        if (this.$element.find('.next, .prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end)
            this.cycle(true)
        }

        this.interval = clearInterval(this.interval)

        return this
    }

    Carousel.prototype.next = function () {
        if (this.sliding) return
        return this.slide('next')
    }

    Carousel.prototype.prev = function () {
        if (this.sliding) return
        return this.slide('prev')
    }

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.item.active')
        var $next = next || this.getItemForDirection(type, $active)
        var isCycling = this.interval
        var direction = type == 'next' ? 'left' : 'right'
        var that = this

        if ($next.hasClass('active')) return (this.sliding = false)

        var relatedTarget = $next[0]
        var slideEvent = $.Event('slide.bs.carousel', {
            relatedTarget: relatedTarget,
            direction: direction
        })
        this.$element.trigger(slideEvent)
        if (slideEvent.isDefaultPrevented()) return

        this.sliding = true

        isCycling && this.pause()

        if (this.$indicators.length) {
            this.$indicators.find('.active').removeClass('active')
            var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
            $nextIndicator && $nextIndicator.addClass('active')
        }

        var slidEvent = $.Event('slid.bs.carousel', {relatedTarget: relatedTarget, direction: direction}) // yes, "slid"
        if ($.support.transition && this.$element.hasClass('slide')) {
            $next.addClass(type)
            $next[0].offsetWidth // force reflow
            $active.addClass(direction)
            $next.addClass(direction)
            $active
                .one('bsTransitionEnd', function () {
                    $next.removeClass([type, direction].join(' ')).addClass('active')
                    $active.removeClass(['active', direction].join(' '))
                    that.sliding = false
                    setTimeout(function () {
                        that.$element.trigger(slidEvent)
                    }, 0)
                })
                .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
        } else {
            $active.removeClass('active')
            $next.addClass('active')
            this.sliding = false
            this.$element.trigger(slidEvent)
        }

        isCycling && this.cycle()

        return this
    }


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.carousel')
            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
            var action = typeof option == 'string' ? option : options.slide

            if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
            if (typeof option == 'number') data.to(option)
            else if (action) data[action]()
            else if (options.interval) data.pause().cycle()
        })
    }

    var old = $.fn.carousel

    $.fn.carousel = Plugin
    $.fn.carousel.Constructor = Carousel


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.carousel.noConflict = function () {
        $.fn.carousel = old
        return this
    }


    // CAROUSEL DATA-API
    // =================

    var clickHandler = function (e) {
        var href
        var $this = $(this)
        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
        if (!$target.hasClass('carousel')) return
        var options = $.extend({}, $target.data(), $this.data())
        var slideIndex = $this.attr('data-slide-to')
        if (slideIndex) options.interval = false

        Plugin.call($target, options)

        if (slideIndex) {
            $target.data('bs.carousel').to(slideIndex)
        }

        e.preventDefault()
    }

    $(document)
        .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
        .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

    $(window).on('load', function () {
        $('[data-ride="carousel"]').each(function () {
            var $carousel = $(this)
            Plugin.call($carousel, $carousel.data())
        })
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // DROPDOWN CLASS DEFINITION
    // =========================

    var backdrop = '.dropdown-backdrop'
    var toggle = '[data-toggle="dropdown"]'
    var Dropdown = function (element) {
        $(element).on('click.bs.dropdown', this.toggle)
    }

    Dropdown.VERSION = '3.3.7'

    function getParent($this) {
        var selector = $this.attr('data-target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        var $parent = selector && $(selector)

        return $parent && $parent.length ? $parent : $this.parent()
    }

    function clearMenus(e) {
        if (e && e.which === 3) return
        $(backdrop).remove()
        $(toggle).each(function () {
            var $this = $(this)
            var $parent = getParent($this)
            var relatedTarget = {relatedTarget: this}

            if (!$parent.hasClass('open')) return

            if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

            $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

            if (e.isDefaultPrevented()) return

            $this.attr('aria-expanded', 'false')
            $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
        })
    }

    Dropdown.prototype.toggle = function (e) {
        var $this = $(this)

        if ($this.is('.disabled, :disabled')) return

        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')

        clearMenus()

        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $(document.createElement('div'))
                    .addClass('dropdown-backdrop')
                    .insertAfter($(this))
                    .on('click', clearMenus)
            }

            var relatedTarget = {relatedTarget: this}
            $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

            if (e.isDefaultPrevented()) return

            $this
                .trigger('focus')
                .attr('aria-expanded', 'true')

            $parent
                .toggleClass('open')
                .trigger($.Event('shown.bs.dropdown', relatedTarget))
        }

        return false
    }

    Dropdown.prototype.keydown = function (e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

        var $this = $(this)

        e.preventDefault()
        e.stopPropagation()

        if ($this.is('.disabled, :disabled')) return

        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')

        if (!isActive && e.which != 27 || isActive && e.which == 27) {
            if (e.which == 27) $parent.find(toggle).trigger('focus')
            return $this.trigger('click')
        }

        var desc = ' li:not(.disabled):visible a'
        var $items = $parent.find('.dropdown-menu' + desc)

        if (!$items.length) return

        var index = $items.index(e.target)

        if (e.which == 38 && index > 0)                 index--         // up
        if (e.which == 40 && index < $items.length - 1) index++         // down
        if (!~index)                                    index = 0

        $items.eq(index).trigger('focus')
    }


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.dropdown')

            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.dropdown

    $.fn.dropdown = Plugin
    $.fn.dropdown.Constructor = Dropdown


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old
        return this
    }


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.bs.dropdown.data-api', clearMenus)
        .on('click.bs.dropdown.data-api', '.dropdown form', function (e) {
            e.stopPropagation()
        })
        .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
        .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function (element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$dialog = this.$element.find('.modal-dialog')
        this.$backdrop = null
        this.isShown = null
        this.originalBodyPad = null
        this.scrollbarWidth = 0
        this.ignoreBackdropClick = false

        if (this.options.remote) {
            this.$element
                .find('.modal-content')
                .load(this.options.remote, $.proxy(function () {
                    this.$element.trigger('loaded.bs.modal')
                }, this))
        }
    }

    Modal.VERSION = '3.3.7'

    Modal.TRANSITION_DURATION = 300
    Modal.BACKDROP_TRANSITION_DURATION = 150

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }

    Modal.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }

    Modal.prototype.show = function (_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', {relatedTarget: _relatedTarget})

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('modal-open')

        this.escape()
        this.resize()

        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

        this.$dialog.on('mousedown.dismiss.bs.modal', function () {
            that.$element.one('mouseup.dismiss.bs.modal', function (e) {
                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
            })
        })

        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass('fade')

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0)

            that.adjustDialog()

            if (transition) {
                that.$element[0].offsetWidth // force reflow
            }

            that.$element.addClass('in')

            that.enforceFocus()

            var e = $.Event('shown.bs.modal', {relatedTarget: _relatedTarget})

            transition ?
                that.$dialog // wait for modal to slide in
                    .one('bsTransitionEnd', function () {
                        that.$element.trigger('focus').trigger(e)
                    })
                    .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                that.$element.trigger('focus').trigger(e)
        })
    }

    Modal.prototype.hide = function (e) {
        if (e) e.preventDefault()

        e = $.Event('hide.bs.modal')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()
        this.resize()

        $(document).off('focusin.bs.modal')

        this.$element
            .removeClass('in')
            .off('click.dismiss.bs.modal')
            .off('mouseup.dismiss.bs.modal')

        this.$dialog.off('mousedown.dismiss.bs.modal')

        $.support.transition && this.$element.hasClass('fade') ?
            this.$element
                .one('bsTransitionEnd', $.proxy(this.hideModal, this))
                .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
            this.hideModal()
    }

    Modal.prototype.enforceFocus = function () {
        $(document)
            .off('focusin.bs.modal') // guard against infinite focus loop
            .on('focusin.bs.modal', $.proxy(function (e) {
                if (document !== e.target &&
                    this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.trigger('focus')
                }
            }, this))
    }

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal')
        }
    }

    Modal.prototype.resize = function () {
        if (this.isShown) {
            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
        } else {
            $(window).off('resize.bs.modal')
        }
    }

    Modal.prototype.hideModal = function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
            that.$body.removeClass('modal-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.modal')
        })
    }

    Modal.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }

    Modal.prototype.backdrop = function (callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate

            this.$backdrop = $(document.createElement('div'))
                .addClass('modal-backdrop ' + animate)
                .appendTo(this.$body)

            this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
                if (this.ignoreBackdropClick) {
                    this.ignoreBackdropClick = false
                    return
                }
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static'
                    ? this.$element[0].focus()
                    : this.hide()
            }, this))

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')

            if (!callback) return

            doAnimate ?
                this.$backdrop
                    .one('bsTransitionEnd', callback)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callback()

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')

            var callbackRemove = function () {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                    .one('bsTransitionEnd', callbackRemove)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callbackRemove()

        } else if (callback) {
            callback()
        }
    }

    // these following methods are used to handle overflowing modals

    Modal.prototype.handleUpdate = function () {
        this.adjustDialog()
    }

    Modal.prototype.adjustDialog = function () {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        })
    }

    Modal.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: '',
            paddingRight: ''
        })
    }

    Modal.prototype.checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect()
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
        this.scrollbarWidth = this.measureScrollbar()
    }

    Modal.prototype.setScrollbar = function () {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        this.originalBodyPad = document.body.style.paddingRight || ''
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }

    Modal.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', this.originalBodyPad)
    }

    Modal.prototype.measureScrollbar = function () { // thx walsh
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }


    // MODAL PLUGIN DEFINITION
    // =======================

    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }

    var old = $.fn.modal

    $.fn.modal = Plugin
    $.fn.modal.Constructor = Modal


    // MODAL NO CONFLICT
    // =================

    $.fn.modal.noConflict = function () {
        $.fn.modal = old
        return this
    }


    // MODAL DATA-API
    // ==============

    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({remote: !/#/.test(href) && href}, $target.data(), $this.data())

        if ($this.is('a')) e.preventDefault()

        $target.one('show.bs.modal', function (showEvent) {
            if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
            $target.one('hidden.bs.modal', function () {
                $this.is(':visible') && $this.trigger('focus')
            })
        })
        Plugin.call($target, option, this)
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type = null
        this.options = null
        this.enabled = null
        this.timeout = null
        this.hoverState = null
        this.$element = null
        this.inState = null

        this.init('tooltip', element, options)
    }

    Tooltip.VERSION = '3.3.7'

    Tooltip.TRANSITION_DURATION = 150

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {
            selector: 'body',
            padding: 0
        }
    }

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true
        this.type = type
        this.$element = $(element)
        this.options = this.getOptions(options)
        this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
        this.inState = {click: false, hover: false, focus: false}

        if (this.$element[0] instanceof document.constructor && !this.options.selector) {
            throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
        }

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin'
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

                this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }

        this.options.selector ?
            (this._options = $.extend({}, this.options, {trigger: 'manual', selector: ''})) :
            this.fixTitle()
    }

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS
    }

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)

        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            }
        }

        return options
    }

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {}
        var defaults = this.getDefaults()

        this._options && $.each(this._options, function (key, value) {
            if (defaults[key] != value) options[key] = value
        })

        return options
    }

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).data('bs.' + this.type)

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }

        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
        }

        if (self.tip().hasClass('in') || self.hoverState == 'in') {
            self.hoverState = 'in'
            return
        }

        clearTimeout(self.timeout)

        self.hoverState = 'in'

        if (!self.options.delay || !self.options.delay.show) return self.show()

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
    }

    Tooltip.prototype.isInStateTrue = function () {
        for (var key in this.inState) {
            if (this.inState[key]) return true
        }

        return false
    }

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).data('bs.' + this.type)

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }

        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
        }

        if (self.isInStateTrue()) return

        clearTimeout(self.timeout)

        self.hoverState = 'out'

        if (!self.options.delay || !self.options.delay.hide) return self.hide()

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    }

    Tooltip.prototype.show = function () {
        var e = $.Event('show.bs.' + this.type)

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e)

            var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
            if (e.isDefaultPrevented() || !inDom) return
            var that = this

            var $tip = this.tip()

            var tipId = this.getUID(this.type)

            this.setContent()
            $tip.attr('id', tipId)
            this.$element.attr('aria-describedby', tipId)

            if (this.options.animation) $tip.addClass('fade')

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement

            var autoToken = /\s?auto?\s?/i
            var autoPlace = autoToken.test(placement)
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

            $tip
                .detach()
                .css({top: 0, left: 0, display: 'block'})
                .addClass(placement)
                .data('bs.' + this.type, this)

            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
            this.$element.trigger('inserted.bs.' + this.type)

            var pos = this.getPosition()
            var actualWidth = $tip[0].offsetWidth
            var actualHeight = $tip[0].offsetHeight

            if (autoPlace) {
                var orgPlacement = placement
                var viewportDim = this.getPosition(this.$viewport)

                placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' :
                    placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' :
                        placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' :
                            placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' :
                                placement

                $tip
                    .removeClass(orgPlacement)
                    .addClass(placement)
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

            this.applyPlacement(calculatedOffset, placement)

            var complete = function () {
                var prevHoverState = that.hoverState
                that.$element.trigger('shown.bs.' + that.type)
                that.hoverState = null

                if (prevHoverState == 'out') that.leave(that)
            }

            $.support.transition && this.$tip.hasClass('fade') ?
                $tip
                    .one('bsTransitionEnd', complete)
                    .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
                complete()
        }
    }

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var $tip = this.tip()
        var width = $tip[0].offsetWidth
        var height = $tip[0].offsetHeight

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10)
        var marginLeft = parseInt($tip.css('margin-left'), 10)

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop))  marginTop = 0
        if (isNaN(marginLeft)) marginLeft = 0

        offset.top += marginTop
        offset.left += marginLeft

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function (props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                })
            }
        }, offset), 0)

        $tip.addClass('in')

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth = $tip[0].offsetWidth
        var actualHeight = $tip[0].offsetHeight

        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight
        }

        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

        if (delta.left) offset.left += delta.left
        else offset.top += delta.top

        var isVertical = /top|bottom/.test(placement)
        var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

        $tip.offset(offset)
        this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
    }

    Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
        this.arrow()
            .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
            .css(isVertical ? 'top' : 'left', '')
    }

    Tooltip.prototype.setContent = function () {
        var $tip = this.tip()
        var title = this.getTitle()

        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
    }

    Tooltip.prototype.hide = function (callback) {
        var that = this
        var $tip = $(this.$tip)
        var e = $.Event('hide.bs.' + this.type)

        function complete() {
            if (that.hoverState != 'in') $tip.detach()
            if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
                that.$element
                    .removeAttr('aria-describedby')
                    .trigger('hidden.bs.' + that.type)
            }
            callback && callback()
        }

        this.$element.trigger(e)

        if (e.isDefaultPrevented()) return

        $tip.removeClass('in')

        $.support.transition && $tip.hasClass('fade') ?
            $tip
                .one('bsTransitionEnd', complete)
                .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
            complete()

        this.hoverState = null

        return this
    }

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element
        if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    }

    Tooltip.prototype.hasContent = function () {
        return this.getTitle()
    }

    Tooltip.prototype.getPosition = function ($element) {
        $element = $element || this.$element

        var el = $element[0]
        var isBody = el.tagName == 'BODY'

        var elRect = el.getBoundingClientRect()
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = $.extend({}, elRect, {width: elRect.right - elRect.left, height: elRect.bottom - elRect.top})
        }
        var isSvg = window.SVGElement && el instanceof window.SVGElement
        // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
        // See https://github.com/twbs/bootstrap/issues/20280
        var elOffset = isBody ? {top: 0, left: 0} : (isSvg ? null : $element.offset())
        var scroll = {scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop()}
        var outerDims = isBody ? {width: $(window).width(), height: $(window).height()} : null

        return $.extend({}, elRect, scroll, outerDims, elOffset)
    }

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2} :
            placement == 'top' ? {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2} :
                placement == 'left' ? {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth} :
                    /* placement == 'right' */ {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left + pos.width
                }

    }

    Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
        var delta = {top: 0, left: 0}
        if (!this.$viewport) return delta

        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
        var viewportDimensions = this.getPosition(this.$viewport)

        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
            if (topEdgeOffset < viewportDimensions.top) { // top overflow
                delta.top = viewportDimensions.top - topEdgeOffset
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth
            if (leftEdgeOffset < viewportDimensions.left) { // left overflow
                delta.left = viewportDimensions.left - leftEdgeOffset
            } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
            }
        }

        return delta
    }

    Tooltip.prototype.getTitle = function () {
        var title
        var $e = this.$element
        var o = this.options

        title = $e.attr('data-original-title')
            || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)

        return title
    }

    Tooltip.prototype.getUID = function (prefix) {
        do prefix += ~~(Math.random() * 1000000)
        while (document.getElementById(prefix))
        return prefix
    }

    Tooltip.prototype.tip = function () {
        if (!this.$tip) {
            this.$tip = $(this.options.template)
            if (this.$tip.length != 1) {
                throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
            }
        }
        return this.$tip
    }

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
    }

    Tooltip.prototype.enable = function () {
        this.enabled = true
    }

    Tooltip.prototype.disable = function () {
        this.enabled = false
    }

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled
    }

    Tooltip.prototype.toggle = function (e) {
        var self = this
        if (e) {
            self = $(e.currentTarget).data('bs.' + this.type)
            if (!self) {
                self = new this.constructor(e.currentTarget, this.getDelegateOptions())
                $(e.currentTarget).data('bs.' + this.type, self)
            }
        }

        if (e) {
            self.inState.click = !self.inState.click
            if (self.isInStateTrue()) self.enter(self)
            else self.leave(self)
        } else {
            self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
        }
    }

    Tooltip.prototype.destroy = function () {
        var that = this
        clearTimeout(this.timeout)
        this.hide(function () {
            that.$element.off('.' + that.type).removeData('bs.' + that.type)
            if (that.$tip) {
                that.$tip.detach()
            }
            that.$tip = null
            that.$arrow = null
            that.$viewport = null
            that.$element = null
        })
    }


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.tooltip')
            var options = typeof option == 'object' && option

            if (!data && /destroy|hide/.test(option)) return
            if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tooltip

    $.fn.tooltip = Plugin
    $.fn.tooltip.Constructor = Tooltip


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old
        return this
    }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // POPOVER PUBLIC CLASS DEFINITION
    // ===============================

    var Popover = function (element, options) {
        this.init('popover', element, options)
    }

    if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

    Popover.VERSION = '3.3.7'

    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right',
        trigger: 'click',
        content: '',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    })


    // NOTE: POPOVER EXTENDS tooltip.js
    // ================================

    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

    Popover.prototype.constructor = Popover

    Popover.prototype.getDefaults = function () {
        return Popover.DEFAULTS
    }

    Popover.prototype.setContent = function () {
        var $tip = this.tip()
        var title = this.getTitle()
        var content = this.getContent()

        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
            this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
            ](content)

        $tip.removeClass('fade top bottom left right in')

        // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
        // this manually by checking the contents.
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }

    Popover.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }

    Popover.prototype.getContent = function () {
        var $e = this.$element
        var o = this.options

        return $e.attr('data-content')
            || (typeof o.content == 'function' ?
                o.content.call($e[0]) :
                o.content)
    }

    Popover.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
    }


    // POPOVER PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.popover')
            var options = typeof option == 'object' && option

            if (!data && /destroy|hide/.test(option)) return
            if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.popover

    $.fn.popover = Plugin
    $.fn.popover.Constructor = Popover


    // POPOVER NO CONFLICT
    // ===================

    $.fn.popover.noConflict = function () {
        $.fn.popover = old
        return this
    }

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function (element) {
        // jscs:disable requireDollarBeforejQueryAssignment
        this.element = $(element)
        // jscs:enable requireDollarBeforejQueryAssignment
    }

    Tab.VERSION = '3.3.7'

    Tab.TRANSITION_DURATION = 150

    Tab.prototype.show = function () {
        var $this = this.element
        var $ul = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        if ($this.parent('li').hasClass('active')) return

        var $previous = $ul.find('.active:last a')
        var hideEvent = $.Event('hide.bs.tab', {
            relatedTarget: $this[0]
        })
        var showEvent = $.Event('show.bs.tab', {
            relatedTarget: $previous[0]
        })

        $previous.trigger(hideEvent)
        $this.trigger(showEvent)

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

        var $target = $(selector)

        this.activate($this.closest('li'), $ul)
        this.activate($target, $target.parent(), function () {
            $previous.trigger({
                type: 'hidden.bs.tab',
                relatedTarget: $this[0]
            })
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: $previous[0]
            })
        })
    }

    Tab.prototype.activate = function (element, container, callback) {
        var $active = container.find('> .active')
        var transition = callback
            && $.support.transition
            && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

        function next() {
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active')
                .end()
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', false)

            element
                .addClass('active')
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', true)

            if (transition) {
                element[0].offsetWidth // reflow for transition
                element.addClass('in')
            } else {
                element.removeClass('fade')
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('active')
                    .end()
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', true)
            }

            callback && callback()
        }

        $active.length && transition ?
            $active
                .one('bsTransitionEnd', next)
                .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
            next()

        $active.removeClass('in')
    }


    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.tab')

            if (!data) $this.data('bs.tab', (data = new Tab(this)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tab

    $.fn.tab = Plugin
    $.fn.tab.Constructor = Tab


    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function () {
        $.fn.tab = old
        return this
    }


    // TAB DATA-API
    // ============

    var clickHandler = function (e) {
        e.preventDefault()
        Plugin.call($(this), 'show')
    }

    $(document)
        .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
        .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // AFFIX CLASS DEFINITION
    // ======================

    var Affix = function (element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options)

        this.$target = $(this.options.target)
            .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
            .on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this))

        this.$element = $(element)
        this.affixed = null
        this.unpin = null
        this.pinnedOffset = null

        this.checkPosition()
    }

    Affix.VERSION = '3.3.7'

    Affix.RESET = 'affix affix-top affix-bottom'

    Affix.DEFAULTS = {
        offset: 0,
        target: window
    }

    Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        var targetHeight = this.$target.height()

        if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

        if (this.affixed == 'bottom') {
            if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
            return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
        }

        var initializing = this.affixed == null
        var colliderTop = initializing ? scrollTop : position.top
        var colliderHeight = initializing ? targetHeight : height

        if (offsetTop != null && scrollTop <= offsetTop) return 'top'
        if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

        return false
    }

    Affix.prototype.getPinnedOffset = function () {
        if (this.pinnedOffset) return this.pinnedOffset
        this.$element.removeClass(Affix.RESET).addClass('affix')
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        return (this.pinnedOffset = position.top - scrollTop)
    }

    Affix.prototype.checkPositionWithEventLoop = function () {
        setTimeout($.proxy(this.checkPosition, this), 1)
    }

    Affix.prototype.checkPosition = function () {
        if (!this.$element.is(':visible')) return

        var height = this.$element.height()
        var offset = this.options.offset
        var offsetTop = offset.top
        var offsetBottom = offset.bottom
        var scrollHeight = Math.max($(document).height(), $(document.body).height())

        if (typeof offset != 'object')         offsetBottom = offsetTop = offset
        if (typeof offsetTop == 'function')    offsetTop = offset.top(this.$element)
        if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

        var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

        if (this.affixed != affix) {
            if (this.unpin != null) this.$element.css('top', '')

            var affixType = 'affix' + (affix ? '-' + affix : '')
            var e = $.Event(affixType + '.bs.affix')

            this.$element.trigger(e)

            if (e.isDefaultPrevented()) return

            this.affixed = affix
            this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

            this.$element
                .removeClass(Affix.RESET)
                .addClass(affixType)
                .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
        }

        if (affix == 'bottom') {
            this.$element.offset({
                top: scrollHeight - height - offsetBottom
            })
        }
    }


    // AFFIX PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.affix')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.affix

    $.fn.affix = Plugin
    $.fn.affix.Constructor = Affix


    // AFFIX NO CONFLICT
    // =================

    $.fn.affix.noConflict = function () {
        $.fn.affix = old
        return this
    }


    // AFFIX DATA-API
    // ==============

    $(window).on('load', function () {
        $('[data-spy="affix"]').each(function () {
            var $spy = $(this)
            var data = $spy.data()

            data.offset = data.offset || {}

            if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
            if (data.offsetTop != null) data.offset.top = data.offsetTop

            Plugin.call($spy, data)
        })
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
    'use strict';

    // COLLAPSE PUBLIC CLASS DEFINITION
    // ================================

    var Collapse = function (element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Collapse.DEFAULTS, options)
        this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
            '[data-toggle="collapse"][data-target="#' + element.id + '"]')
        this.transitioning = null

        if (this.options.parent) {
            this.$parent = this.getParent()
        } else {
            this.addAriaAndCollapsedClass(this.$element, this.$trigger)
        }

        if (this.options.toggle) this.toggle()
    }

    Collapse.VERSION = '3.3.7'

    Collapse.TRANSITION_DURATION = 350

    Collapse.DEFAULTS = {
        toggle: true
    }

    Collapse.prototype.dimension = function () {
        var hasWidth = this.$element.hasClass('width')
        return hasWidth ? 'width' : 'height'
    }

    Collapse.prototype.show = function () {
        if (this.transitioning || this.$element.hasClass('in')) return

        var activesData
        var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

        if (actives && actives.length) {
            activesData = actives.data('bs.collapse')
            if (activesData && activesData.transitioning) return
        }

        var startEvent = $.Event('show.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return

        if (actives && actives.length) {
            Plugin.call(actives, 'hide')
            activesData || actives.data('bs.collapse', null)
        }

        var dimension = this.dimension()

        this.$element
            .removeClass('collapse')
            .addClass('collapsing')[dimension](0)
            .attr('aria-expanded', true)

        this.$trigger
            .removeClass('collapsed')
            .attr('aria-expanded', true)

        this.transitioning = 1

        var complete = function () {
            this.$element
                .removeClass('collapsing')
                .addClass('collapse in')[dimension]('')
            this.transitioning = 0
            this.$element
                .trigger('shown.bs.collapse')
        }

        if (!$.support.transition) return complete.call(this)

        var scrollSize = $.camelCase(['scroll', dimension].join('-'))

        this.$element
            .one('bsTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
    }

    Collapse.prototype.hide = function () {
        if (this.transitioning || !this.$element.hasClass('in')) return

        var startEvent = $.Event('hide.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return

        var dimension = this.dimension()

        this.$element[dimension](this.$element[dimension]())[0].offsetHeight

        this.$element
            .addClass('collapsing')
            .removeClass('collapse in')
            .attr('aria-expanded', false)

        this.$trigger
            .addClass('collapsed')
            .attr('aria-expanded', false)

        this.transitioning = 1

        var complete = function () {
            this.transitioning = 0
            this.$element
                .removeClass('collapsing')
                .addClass('collapse')
                .trigger('hidden.bs.collapse')
        }

        if (!$.support.transition) return complete.call(this)

        this.$element
            [dimension](0)
            .one('bsTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
    }

    Collapse.prototype.toggle = function () {
        this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

    Collapse.prototype.getParent = function () {
        return $(this.options.parent)
            .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
            .each($.proxy(function (i, element) {
                var $element = $(element)
                this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
            }, this))
            .end()
    }

    Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
        var isOpen = $element.hasClass('in')

        $element.attr('aria-expanded', isOpen)
        $trigger
            .toggleClass('collapsed', !isOpen)
            .attr('aria-expanded', isOpen)
    }

    function getTargetFromTrigger($trigger) {
        var href
        var target = $trigger.attr('data-target')
            || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

        return $(target)
    }


    // COLLAPSE PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.collapse')
            var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
            if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.collapse

    $.fn.collapse = Plugin
    $.fn.collapse.Constructor = Collapse


    // COLLAPSE NO CONFLICT
    // ====================

    $.fn.collapse.noConflict = function () {
        $.fn.collapse = old
        return this
    }


    // COLLAPSE DATA-API
    // =================

    $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
        var $this = $(this)

        if (!$this.attr('data-target')) e.preventDefault()

        var $target = getTargetFromTrigger($this)
        var data = $target.data('bs.collapse')
        var option = data ? 'toggle' : $this.data()

        Plugin.call($target, option)
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // SCROLLSPY CLASS DEFINITION
    // ==========================

    function ScrollSpy(element, options) {
        this.$body = $(document.body)
        this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options)
        this.selector = (this.options.target || '') + ' .nav li > a'
        this.offsets = []
        this.targets = []
        this.activeTarget = null
        this.scrollHeight = 0

        this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
        this.refresh()
        this.process()
    }

    ScrollSpy.VERSION = '3.3.7'

    ScrollSpy.DEFAULTS = {
        offset: 10
    }

    ScrollSpy.prototype.getScrollHeight = function () {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    }

    ScrollSpy.prototype.refresh = function () {
        var that = this
        var offsetMethod = 'offset'
        var offsetBase = 0

        this.offsets = []
        this.targets = []
        this.scrollHeight = this.getScrollHeight()

        if (!$.isWindow(this.$scrollElement[0])) {
            offsetMethod = 'position'
            offsetBase = this.$scrollElement.scrollTop()
        }

        this.$body
            .find(this.selector)
            .map(function () {
                var $el = $(this)
                var href = $el.data('target') || $el.attr('href')
                var $href = /^#./.test(href) && $(href)

                return ($href
                    && $href.length
                    && $href.is(':visible')
                    && [[$href[offsetMethod]().top + offsetBase, href]]) || null
            })
            .sort(function (a, b) {
                return a[0] - b[0]
            })
            .each(function () {
                that.offsets.push(this[0])
                that.targets.push(this[1])
            })
    }

    ScrollSpy.prototype.process = function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
        var scrollHeight = this.getScrollHeight()
        var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height()
        var offsets = this.offsets
        var targets = this.targets
        var activeTarget = this.activeTarget
        var i

        if (this.scrollHeight != scrollHeight) {
            this.refresh()
        }

        if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
        }

        if (activeTarget && scrollTop < offsets[0]) {
            this.activeTarget = null
            return this.clear()
        }

        for (i = offsets.length; i--;) {
            activeTarget != targets[i]
            && scrollTop >= offsets[i]
            && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
            && this.activate(targets[i])
        }
    }

    ScrollSpy.prototype.activate = function (target) {
        this.activeTarget = target

        this.clear()

        var selector = this.selector +
            '[data-target="' + target + '"],' +
            this.selector + '[href="' + target + '"]'

        var active = $(selector)
            .parents('li')
            .addClass('active')

        if (active.parent('.dropdown-menu').length) {
            active = active
                .closest('li.dropdown')
                .addClass('active')
        }

        active.trigger('activate.bs.scrollspy')
    }

    ScrollSpy.prototype.clear = function () {
        $(this.selector)
            .parentsUntil(this.options.target, '.active')
            .removeClass('active')
    }


    // SCROLLSPY PLUGIN DEFINITION
    // ===========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.scrollspy')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.scrollspy

    $.fn.scrollspy = Plugin
    $.fn.scrollspy.Constructor = ScrollSpy


    // SCROLLSPY NO CONFLICT
    // =====================

    $.fn.scrollspy.noConflict = function () {
        $.fn.scrollspy = old
        return this
    }


    // SCROLLSPY DATA-API
    // ==================

    $(window).on('load.bs.scrollspy.data-api', function () {
        $('[data-spy="scroll"]').each(function () {
            var $spy = $(this)
            Plugin.call($spy, $spy.data())
        })
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap')

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {end: transEndEventNames[name]}
            }
        }

        return false // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function (duration) {
        var called = false
        var $el = this
        $(this).one('bsTransitionEnd', function () {
            called = true
        })
        var callback = function () {
            if (!called) $($el).trigger($.support.transition.end)
        }
        setTimeout(callback, duration)
        return this
    }

    $(function () {
        $.support.transition = transitionEnd()

        if (!$.support.transition) return

        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function (e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })

}(jQuery);


(function ($) {
    'use strict';


    jQuery(document).ready(function () {




        jQuery('#main').click(function () {
            //jQuery('#home').trigger('click');

            if (jQuery(this).is(':checked')) {
                jQuery('.collapsible input').prop('checked', true);
            } else {
                jQuery('.collapsible input').prop('checked', false);
            }


        });

        jQuery('table.ads_list').each(function () {
            if(jQuery('table.ads_list tr').length>0){

                var currentPage = 0;
                var numPerPage = 10;
                var $table = jQuery(this);
                $table.bind('repaginate', function () {
                    $table.find('tbody tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
                });
                $table.trigger('repaginate');
                var numRows = $table.find('tbody tr').length;
                var numPages = Math.ceil(numRows / numPerPage);
                var $pager = jQuery('<ul class="pagination"></ul>');
                if(numPages!=1) {
                    jQuery('<li><a href="#!" class="btn prev" data-id="">PREV</a></li>').appendTo($pager);
                    for (var page = 0; page < numPages; page++) {
                        jQuery('<li class="waves-effect"><a href="#!"></a></li>').bind('click', {
                            newPage: page
                        }, function (event) {
                            currentPage = event.data['newPage'];
                            $table.trigger('repaginate');
                            jQuery(this).addClass('active').siblings().removeClass('active');
                        }).appendTo($pager).addClass('clickable');
                    }
                    jQuery('<li><a href="#!" class="btn next"  data-id="2">NEXT</a></li>').appendTo($pager);

                    $pager.insertAfter($table).find('li.waves-effect:nth-child(2)').addClass('active');
                }

            }
        });

        jQuery('.pagination .next').on('click', function(){
            if(jQuery('.pagination .active').next().hasClass('waves-effect')) {
                jQuery('.pagination .active').next().find('a').trigger('click');
            }
        });

        jQuery('.pagination .prev').on('click', function(){
            if(jQuery('.pagination .active').prev().hasClass('waves-effect')) {
                jQuery('.pagination .active').prev().find('a').trigger('click');
            }
        });



        jQuery('.collapsible').collapsible({
            accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
        jQuery('.collapsible .collapsible-header .material-icons').html('arrow_drop_down');
        jQuery('.collapsible .collapsible-header').on('click', function () {
            if (jQuery(this).find('.material-icons').html() == 'arrow_drop_down') {
                jQuery(this).find('.material-icons').html('arrow_drop_up');
            } else {
                jQuery(this).find('.material-icons').html('arrow_drop_down');
            }

        });


        jQuery('#code').slimScroll({
            height: '400px',
            width: '100%',
            size: '6px',
            color: '#646d73',
            alwaysVisible: true,
            distance: '35px',
            railVisible: true,
            railColor: '#2c3033',
            railOpacity: 1,
            wheelStep: 0,
            allowPageScroll: false,
            disableFadeOut: false
        });

        jQuery('#edit_page ul.tabs').tabs();

        jQuery('#copy-button').tooltip();
        // When the copy button is clicked, select the value of the text box, attempt
        // to execute the copy command, and trigger event to update tooltip message
        // to indicate whether the text was successfully copied.
        jQuery('#copy-button').bind('click', function () {
            var input = document.querySelector('#copy-input');
            input.setSelectionRange(0, input.value.length + 1);
            try {
                var success = document.execCommand('copy');
                if (success) {
                    $('#copy-button').trigger('copied', ['Copied!']);
                } else {
                    jQuery('#copy-button').trigger('copied', ['Copy with Ctrl-c']);
                }
            } catch (err) {
                jQuery('#copy-button').trigger('copied', ['Copy with Ctrl-c']);
            }
        });

        // Handler for updating the tooltip message.
        jQuery('#copy-button').bind('copied', function (event, message) {
            jQuery(this).attr('title', message)
                .tooltip('fixTitle')
                .tooltip('show')
                .attr('title', "Copy to Clipboard")
                .tooltip('fixTitle');
        });

        jQuery('[data-toggle="tooltip"]').tooltip();

        jQuery('#accordion').collapse();

        jQuery(function () {
            jQuery("div.bhoechie-tab-menu>div.list-group>a").click(function (e) {
                e.preventDefault();
                jQuery(this).siblings('a.active').removeClass("active");
                jQuery(this).addClass("active");
                var index = jQuery(this).index();
                jQuery("div.bhoechie-tab>div.bhoechie-tab-content").removeClass("active");
                jQuery("div.bhoechie-tab>div.bhoechie-tab-content").eq(index).addClass("active");
            });
        });

    });



})(jQuery);

function changeTemplateImg(id, imgClass) {
    var img = jQuery("#" + id + " option:selected").data('bannerimg');
    jQuery('.' + imgClass).attr('src', img);
    return false;
}


function toggleCheckbox(source, id) {

    if (jQuery(source).is(':checked')) {
        jQuery('#' + id + ' input').prop('checked', true);
    } else {
        jQuery('#' + id + ' input').prop('checked', false);
    }

}

function createTab() {
    var panel_count = jQuery('#accordion .panel').length;
    var panel = jQuery('#accordion .panel')[panel_count - 1];
    panel = jQuery('#tabClone .panel').clone();
    var getHref = jQuery(panel).find('.panel-heading .panel-title a:first').attr('href');
    var s = getHref.split('_');
    var n_c = panel_count + 1;
    jQuery(panel).find('.panel-heading .panel-title a:first').attr('href', '#collapse_' + n_c);
    jQuery(panel).find('.panel-heading  .panel-title a:first').html('Native Apps #' + n_c);
    jQuery(panel).find('.panel-collapse').attr('id', 'collapse_' + n_c);
    jQuery(panel).find('.panel-heading').attr('id', 'heading_' + n_c);
    jQuery(panel).find('.panel-heading  .panel-title a:first').attr('aria-controls', 'collapse_' + n_c);
    jQuery(panel).find('.panel-collapse').attr('aria-labelledby', 'heading_' + n_c);

    jQuery('#accordion').append(panel);
}

function removeTab(tab) {
    jQuery(tab).parent().parent().parent().remove();
}



