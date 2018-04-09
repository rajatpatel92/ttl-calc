var app = new Vue({
    el: '#app',
    data: {
        now: moment().format('hh:mm a'),
        inTimeHH: null,
        inTimeMM: null,
        breakTimeHH: null,
        breakTimeMM: null,
        timeBalanceMM: null,
        strFormat: 'hh:mm a',
        strToGoFormat: 'H:mm',
        calculated430: null,
        calculated700: null,
        calculated830: null,
        calculated830avg: null,
        lastAccessDay: null
    },
    mounted: function () {
        this.retrievePersistData();
    },
    computed: {
        // a computed getter
        calc430today: function () {
            var inTime = moment(this.inTimeHH + ":" + this.inTimeMM, 'HH:mm');
            this.calculated430 = inTime.add({ hours: 4, minutes: 30 }).add({ hours: this.breakTimeHH, minutes: this.breakTimeMM });
            this.updatePersistData();
            return this.calculated430.format(this.strFormat);
        },
        calc700today: function () {
            var inTime = moment(this.inTimeHH + ":" + this.inTimeMM, 'HH:mm');
            this.calculated700 = inTime.add({ hours: 7, minutes: 00 }).add({ hours: this.breakTimeHH, minutes: this.breakTimeMM });
            return this.calculated700.format(this.strFormat);
        },
        calc830today: function () {
            var inTime = moment(this.inTimeHH + ":" + this.inTimeMM, 'HH:mm');
            this.calculated830 = inTime.add({ hours: 8, minutes: 30 }).add({ hours: this.breakTimeHH, minutes: this.breakTimeMM });
            return this.calculated830.format(this.strFormat);
        },
        calc830avg: function () {
            var inTime = moment(this.inTimeHH + ":" + this.inTimeMM, 'HH:mm');
            if (this.timeBalanceMM < 90) {
                this.calculated830avg = inTime.add({ hours: 8, minutes: 30 })
                                                .add({ hours: this.breakTimeHH, minutes: this.breakTimeMM })
                                                .subtract({ minutes: this.timeBalanceMM });
            } else {
                this.calculated830avg = this.caluclated700today;
            }
            return this.calculated830avg.format(this.strFormat);
        },
        hrsToGo430today: function () {
            return this.getDiffString(this.calculated430.diff(moment(), 'minutes'));
        },
        hrsToGo700today: function () {
            return this.getDiffString(this.calculated700.diff(moment(), 'minutes'));
        },
        hrsToGo830today: function () {
            return this.getDiffString(this.calculated830.diff(moment(), 'minutes'));
        },
        hrsToGo830avg: function () {
            return this.getDiffString(this.calculated830avg.diff(moment(), 'minutes'));
        }
    },
    methods: {
        getDiffString : function (difference) {
            if (difference > 0){
                return moment().hour(0).minutes(difference).format(this.strToGoFormat) + " to go";
            } else {
                return "Done";
            }
        },
        getLocalData: function (key, myScope, myCallBack) {
            chrome.storage.local.get ([key], function (result) {
                if (!result) {
                    console.log("getLocalData null returned - " + key + ":" + result.key );
                }
                if (typeof myCallBack === "function") {
                    myCallBack.apply(myScope, [result]);
                }
            });
        },
        setLocalData: function (myKey, myValue) {
            var obj = {};       
            var key = myKey;  
            obj[key] = myValue;   
            chrome.storage.local.set(obj);
        },
        retrievePersistData: function () {
            this.getLocalData('lastAccessDay', this, function (storedAccessDay) {
                if (storedAccessDay) {
                    if (storedAccessDay !== moment().dayOfYear().toString()) {
                        this.lastAccessDay = moment().dayOfYear().toString();
                    }
                    this.getLocalData('inTimeHH', this, function (value) {
                        if (value.inTimeHH) {
                            this.inTimeHH = value.inTimeHH;
                        } else {
                            this.inTimeHH = 9;
                            this.setLocalData ('inTimeHH', this.inTimeHH.toString());
                        }
                    });
                    this.getLocalData('inTimeMM', this, function (value) {
                        if (value.inTimeMM) {                          
                            this.inTimeMM = value.inTimeMM;
                        } else {
                            this.inTimeMM = 30;
                            this.setLocalData ('inTimeMM', this.inTimeMM.toString());
                        }
                    });
                    this.getLocalData('breakTimeHH', this, function (value) {
                        if (value.breakTimeHH) {
                            this.breakTimeHH = value.breakTimeHH;
                        } else {
                            this.breakTimeHH = 0;
                            this.setLocalData ('breakTimeHH', this.breakTimeHH.toString());
                        }
                    });
                    this.getLocalData('breakTimeMM', this, function (value) {
                        if (value.breakTimeMM) {
                            this.breakTimeMM = value.breakTimeMM;
                        } else {
                            this.breakTimeMM = 0;
                            this.setLocalData('breakTimeMM', this.breakTimeMM.toString());
                        }
                    });
                    this.getLocalData('timeBalanceMM', this, function (value) {
                        if (value.timeBalanceMM) {
                            this.timeBalanceMM = value.timeBalanceMM;
                        } else {
                            this.timeBalanceMM = 0;
                            this.setLocalData('timeBalanceMM', this.timeBalanceMM.toString());
                        }
                    });
                } else {
                    this.lastAccessDay = moment().dayOfYear().toString();
                    this.setLocalData ('lastAccessDay', moment().dayOfYear().toString());
                }
            });
        },
        updatePersistData: function () {
            this.setLocalData ('lastAccessDay', moment().dayOfYear().toString());
            if (this.inTimeHH) this.setLocalData ('inTimeHH', this.inTimeHH.toString());
            if (this.inTimeMM) this.setLocalData('inTimeMM', this.inTimeMM.toString());
            if (this.breakTimeHH) this.setLocalData ('breakTimeHH', this.breakTimeHH.toString());
            if (this.breakTimeMM) this.setLocalData('breakTimeMM', this.breakTimeMM.toString());
            if (this.timeBalanceMM) this.setLocalData('timeBalanceMM', this.timeBalanceMM.toString());
        }
    }
});