viewedSessionList = {};
var prevSessionCode = '';

//1DS Code starts here
// WCP initialization
var siteConsent = null;

if (!inIframe()) {
    var target = document.createElement('div');
    target.setAttribute('id', "cookie-banner");
    target.setAttribute('style', ' width: 100%;top: 0;background: #f2f2f2;');
    $("#playerDiv").before(target);

    WcpConsent.init("en-US", "cookie-banner", function (err, _siteConsent) {
        if (err != undefined) {
            return err;
        } else {
            siteConsent = _siteConsent;  //siteConsent is used to get the current consent          
        }
    });
}

// 1DS initialization
const mpsonedsanalytics = new oneDS.ApplicationInsights();
var config = {
    instrumentationKey: "88ba87242cab4e8cbdd0ac780d253ff7-5e594059-44a6-45ee-b564-4cbe89fa0b2a-7671",
    channelConfiguration: { // Post channel configuration
        eventsLimitInMem: 50
    },
    webAnalyticsConfiguration: { // Web Analytics Plugin configuration
        autoCapture: {
            scroll: true,
            pageView: true,
            onLoad: true,
            onUnload: true,
            click: true,
            scroll: true,
            resize: true,
            jsError: true
        },
        urlCollectQuery: true,
        urlCollectHash: true,
        isLoggedIn: false //set appropriate login state
    }
};

if (!inIframe()) {
    config.propertyConfiguration = { // Properties Plugin configuration
        callback: {
            userConsentDetails: siteConsent ? siteConsent.getConsent : null
        },
    }
}
//Initialize SDK
mpsonedsanalytics.initialize(config, []);

var appInsights = window.appInsights || function (config) { function r(config) { t[config] = function () { var i = arguments; t.queue.push(function () { t[config].apply(t, i) }) } } var t = { config: config }, u = document, e = window, o = "script", s = u.createElement(o), i, f; for (s.src = config.url || "//az416426.vo.msecnd.net/scripts/a/ai.0.js", u.getElementsByTagName(o)[0].parentNode.appendChild(s), t.cookie = u.cookie, t.queue = [], i = ["Event", "Exception", "Metric", "PageView", "Trace"]; i.length;) r("track" + i.pop()); return r("setAuthenticatedUserContext"), r("clearAuthenticatedUserContext"), config.disableExceptionTracking || (i = "onerror", r("_" + i), f = e[i], e[i] = function (config, r, u, e, o) { var s = f && f(config, r, u, e, o); return s !== !0 && t["_" + i](config, r, u, e, o), s }), t }({
    samplingPercentage: 100, instrumentationKey: getInstrumentationKey(), maxAjaxCallsPerView: -1, sessionRenewalMs: 28800000, sessionExpirationMs: 259200000
}); window.appInsights = appInsights;
appInsights.queue.push(function () {
    try {
        var customId = customUserConfig.getCustomUserId();
        if (customId.length > 0) {
            appInsights.context.user.id = customId;
        }
    }
    catch (ex) { }
    appInsights.context.operation.name = window && window.location && window.location.href.substring(0, 1024);
    appInsights.context.addTelemetryInitializer(function (envelope) {
        if (envelope.name === Microsoft.ApplicationInsights.Telemetry.RemoteDependencyData.envelopeType) {
            return false;
        }
    });
});
// end of insertion
appInsights.trackPageView();

(function () {
    var __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    amp.plugin('appInsights', function (options) {
        var player = this;

        var pluginVersion = 0.1;
        var parsedOptions;
        var playerStateonPageLoad;
        if (options == null) {
            options = {};
        }
        var st = parseInt(getQuerystring("start"));
        options.startTime = (isNaN(st) ? 0 : st);
        options.sessioncode = options.otherAIProps.mpsEventId;
        options.mpsSessionId = customUserConfig.newId();
        options.mpsEventTime = new Date().toISOString();
        options.mpsSequence = 1;
        options.sessiontitles = [];
        if (typeof eventDate != "undefined") {
            var eventD = new Date(eventDate);
            if (!isNaN(eventD.getTime())) {
                var today = new Date(new Date().toDateString());
                options.dateDifference = (today.getTime() - eventD.getTime()) / (1000 * 60 * 60 * 24); //Difference between event date and today's date
            }
        }

        var dataSetupOptions = {};
        if (this.options()["data-setup"]) {
            parsedOptions = JSON.parse(this.options()["data-setup"]);
            if (parsedOptions.ga) {
                dataSetupOptions = parsedOptions.ga;
            }
        }

        if (typeof dynamicsession != 'undefined' && dynamicsession.enable) {

            try {
                player.addEventListener('playing', function () {
                    if (dynamicsession.dsfirsttimePlay) {
                        dynamicsession.dsfirsttimePlay = false;
                        if (typeof player.currentMediaTime() == "undefined" || dynamicsession.consolelog) {
                            var d1 = new Date();
                            var utc = new Date(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds());
                            if (dynamicsession.json.config && dynamicsession.json.config.absolutetime) {
                                dynamicsession.startabsolutetime = ((utc.getTime() - dynamicsession.json.config.streamstart.getTime()) / 1000);// - player.currentTime();
                            }
                            else {
                                if (dynamicsession.json.config && dynamicsession.json.config.streamstart) {
                                    var today = new Date(0); today.setUTCSeconds(getUTCMS(utc));
                                    var ssdate = new Date(0);
                                    var ssepoch = getUTCMS(dynamicsession.json.config.streamstart);
                                    ssdate.setUTCSeconds(ssepoch);
                                    var streamstart = new Date(ssdate.toISOString().slice(0, 10));
                                    var oneday = 1000 * 60 * 60 * 24
                                    var daydifference = Math.trunc(Math.trunc(today.getTime() - streamstart.getTime()) / oneday);
                                    dynamicsession.startmediatime = ((utc.getHours() * 60 * 60) + (utc.getMinutes() * 60) + utc.getSeconds()) + (daydifference * 86400); // - player.currentTime();
                                    //var today = new Date(utc.toISOString().slice(0, 10));
                                    ////var streamstart = new Date(dynamicsession.json.config.streamstart.toISOString().slice(0, 10));
                                    //var ssdate = new Date(0);
                                    //var ssepoch = getUTCMS(dynamicsession.json.config.streamstart);
                                    //ssdate.setUTCSeconds(ssepoch);
                                    //var streamstart = new Date(ssdate.toISOString().slice(0, 10));
                                    //var oneday = 1000 * 60 * 60 * 24
                                    //var daydifference = Math.trunc(today.getTime() - streamstart.getTime()) / oneday;
                                    //dynamicsession.startmediatime = ((utc.getHours() * 60 * 60) + (utc.getMinutes() * 60) + utc.getSeconds()) + (daydifference * 86400); // - player.currentTime();
                                }
                            }
                            dynamicsession.playerInterval = setInterval(function () {
                                if (!player.paused()) {
                                    dynamicsession.playertimer += 1;
                                }
                            }, 1000);
                        }
                    }
                });
                player.addEventListener('pause', function () {
                    dynamicsession.dsfirsttimePlay = true;
                    dynamicsession.playertimer = 0;
                    clearInterval(dynamicsession.playerInterval);
                });
            }
            catch (ex) { }
        }
        //App Insights Config
        appInsights.config.maxBatchInterval = sendInterval = options.sendInterval || dataSetupOptions.sendInterval || 15;
        appInsights.config.disableFlushOnBeforeUnload = true;
        appInsights.maxAjaxCallsPerView = -1;

        //Setting plugin options

        /* All implemented metrics include: ['loaded', 'viewed', 'ended', 'playTime', 'percentsPlayed', 'play', 'pause', 'seek', 'fullscreen', 'error', 'buffering', 'bitrateQuality', 'playbackSummary', 'downloadInfo']; */
        var defaultMetricsToTrack = ['debug', 'playbackSummary', 'loaded', 'viewed', 'ended', 'playTime', 'timeUpdateInterval', 'play', 'pause', 'seek', 'fullscreen', 'error', 'buffering', 'bitrateQuality', 'trackSdn', 'downloadFailed', 'percentsPlayed', 'captions', 'volumechange', 'mutetoggle', 'captionsearch', 'audiotracks', 'linkclick'];
        var listMetricsToTrack = options.metricsToTrack || dataSetupOptions.metricsToTrack || defaultMetricsToTrack;
        var metricsToTrack = {};
        listMetricsToTrack.forEach(function (value, index, array) {
            metricsToTrack[value] = true;
        });


        //enable them once the player files are fixed
        //var percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 5;
        //var timeUpdateInterval = options.timeUpdateInterval || dataSetupOptions.timeUpdateInterval || 15;

        var percentsPlayedInterval = 25;
        var timeUpdateInterval = 25;

        options.debug = options.debug || false;

        //TrackEvent Properties
        if (options.userId || dataSetupOptions.userId) {
            //setting authenticated user context
            var userId = options.userId || dataSetupOptions.userId;
            var accountId = options.accountId || dataSetupOptions.accountId || null;
            appInsights.setAuthenticatedUserContext(userId, accountId);
            if (options.debug) {
                console.log("Authenticated User Context set as userId: " + userId + " and accountId: " + accountId);
            }
        }
        var streamId = options.streamId || dataSetupOptions.streamId || null;

        //enable if you hav SDN or eCDN intentration with AMP
        var trackSdn = options.trackSdn || dataSetupOptions.trackSdn || false;

        //Initializing tracking variables
        var percentsAlreadyTracked = [];
        var lastPercentTracked = -1;
        var percentPlayed = 0;

        var timeAlreadyTracked = [];
        var lastTimeTracked = -1;
        var lastPosition = 0;
        var lastMediaTime = 0;

        if (options.otherAIProps && options.otherAIProps.mpsChannel && options.otherAIProps.mpsEventId) {
            var TrackedInterval = ReadTrackedInterval(options.otherAIProps.mpsChannel + options.otherAIProps.mpsEventId);
            percentsAlreadyTracked = TrackedInterval.playPercentage;
            timeAlreadyTracked = TrackedInterval.playTime;
        }

        var seeking = false;
        var currentProtectionInfo = null;

        //Trim the manifest url to get a streamId
        function mapManifestUrlToId(manifest) {
            var sourceManifest = "unknown";
            if (manifest) {
                sourceManifest = manifest.split("//")[1];
                if (sourceManifest.match(/.ism\/manifest/i)) {
                    sourceManifest = sourceManifest.split(/.ism\/manifest/i)[0] + ".ism/manifest";
                }
            }
            return sourceManifest;
        }

        function mapProtectionInfo(protectionType) {
            var protectionInfo = "unknown";
            if (protectionType) {
                switch (protectionType.toLowerCase()) {
                    case "aes":
                        protectionInfo = "aes";
                        break;
                    case "playready":
                        protectionInfo = "drm";
                        break;
                    case "widevine":
                        protectionInfo = "drm";
                        break;
                    case "fairplay":
                        protectionInfo = "drm";
                        break;
                    default:
                        protectionInfo = "none";
                }
            }
            return protectionInfo;
        }

        //Calculating bufferedAhead *Does not work in SilverlightSS
        function calculateBufferAhead() {
            var buffered = player.buffered();
            var currentTime = player.currentTime();

            if (!buffered) {
                return undefined;
            }

            return Math.max(0, buffered.end(buffered.length - 1) - currentTime);
        }


        //Loading information for tracking start, load times, unload events
        //loadTime is in milliseconds
        var load = {
            loadTime: 0,
            //incase loadedmetadata doesn't fire set start time
            loadTimeStart: new Date().getTime(),
            firstPlay: false,
            endedReached: false,
            videoElementUsed: false,
            unloaddatasent: false,
            updateLoadTime: function () {
                this.loadTime = Math.abs(new Date().getTime() - this.loadTimeStart);
                if (options.debug) {
                    console.log("Player Load Time determined: " + this.loadTime + "ms");
                }
                this.send();
            },
            send: function () {
                //removing outliers @100s for load
                if (metricsToTrack.loaded) {
                    if (this.loadTime < 100000) {
                        // trackEvent("loadTime", { "time": this.loadTime });
                    }
                }
            },
            reset: function () {
                this.loadTime = 0;
                this.loadTimeStart = new Date().getTime();
                this.firstPlay = false;
                this.endedReached = false;
                var streamId = options.streamId || dataSetupOptions.streamId || null;
            }
        }

        //Buffering information for tracking waiting events
        //bufferingTime is in milliseconds
        var buffering = {
            state: false,
            bufferingTime: 0,
            bufferingTimeStart: 0,
            bufferingTimeTotal: 0,
            count: 0,
            enterBuffering: function () {
                if (load.firstPlay) {
                    this.bufferingTimeStart = new Date().getTime();
                    this.state = true;
                    this.count++;
                    if (options.debug) {
                        console.log("Entering buffering state...");
                    }
                }
            },
            send: function (returnValue) {
                var props = {};
                if (this.state) {
                    this.bufferingTime = Math.abs(new Date().getTime() - this.bufferingTimeStart);
                    var currentTime = Math.round(player.currentTime());
                    if (currentTime !== 0) {
                        if (metricsToTrack.buffering) {
                            bufferingMetrics = {
                                'currentTime': currentTime,
                                'bufferingTime': this.bufferingTime,
                            };
                            if (download.videoBuffer) {
                                bufferingMetrics.perceivedBandwidth = download.videoBuffer.perceivedBandwidth;
                            }
                            if (calculateBufferAhead) {
                                bufferingMetrics.buffered = calculateBufferAhead();
                            }
                            props = bufferingMetrics;
                            if (typeof returnValue == "undefined" || (typeof returnValue != "undefined" && !returnValue)) {
                                trackEvent('buffering', props)
                            }
                        }
                    }
                    this.bufferingTimeTotal += this.bufferingTime;
                    this.state = false;
                    if (options.debug) {
                        console.log("Exiting buffering state.  Time spent rebuffering was " + this.bufferingTime + "ms");
                    }
                }
                if (typeof returnValue != "undefined" && returnValue) {
                    return props;
                }
            },
            reset: function () {
                this.bufferingTime = 0;
                this.state = false;
            },
            fullReset: function () {
                this.bufferingTime = 0;
                this.bufferingTimeStart = 0;
                this.bufferingTimeTotal = 0;
                this.count = 0;
                this.state = false;
            }
        }

        var download = {
            videoBuffer: null,
            audioBuffer: null,
            sumBitrate: 0,
            sumPerceivedBandwidth: 0,
            sumMeasuredBandwidth: 0,
            downloadedChunks: 0,
            failedChunks: 0,
            completed: function () {
                if (player.currentDownloadBitrate()) {
                    this.downloadedChunks += 1;
                    this.sumBitrate += player.currentDownloadBitrate();

                    if (this.videoBuffer) {
                        if (metricsToTrack.downloadInfo) {
                            trackEvent("downloadCompleted", { "bitrate": player.currentDownloadBitrate(), "measuredBandwidth": this.videoBuffer.downloadCompleted.measuredBandwidth, "perceivedBandwidth": this.videoBuffer.perceivedBandwidth })
                        }

                        this.sumPerceivedBandwidth += this.videoBuffer.perceivedBandwidth;
                        this.sumMeasuredBandwidth += this.videoBuffer.downloadCompleted.measuredBandwidth;
                    }
                }
            },
            failed: function (type) {
                if (metricsToTrack.downloadInfo || metricsToTrack.downloadFailed) {

                    if (type.toLowerCase() == "audio") {
                        var isVideo = 0;
                        var code = this.audioBuffer.downloadFailed.code.toString(8);
                    } else {
                        var isVideo = 1;
                        var code = this.videoBuffer.downloadFailed.code.toString(8);
                    }

                    trackEvent("downloadFailed", { "isVideo": isVideo, "errorCode": code });
                }
                this.failedChunks++;
            },
            send: function (returnValue) {
                var props = {};
                if (metricsToTrack.bitrateQuality) {
                    if (this.downloadedChunks > 0) {
                        bitrateQualityMetrics = {
                            "avgBitrate": this.sumBitrate / this.downloadedChunks
                        }

                        if (this.videoBuffer) {

                            var AverageMeasuredBandwidth = Math.round(this.sumMeasuredBandwidth / this.downloadedChunks);
                            var AveragePerceivedBandwidth = Math.round(this.sumPerceivedBandwidth / this.downloadedChunks);

                            bitrateQualityMetrics.avgMeasuredBandwidth = AverageMeasuredBandwidth;
                            bitrateQualityMetrics.avgPerceivedBandwidth = AveragePerceivedBandwidth;

                        }
                        props = bitrateQualityMetrics;
                        if (typeof returnValue == "undefined" || (typeof returnValue != "undefined" && !returnValue)) {
                            trackEvent("bitrateQuality", props);
                        }
                    }
                }

                if (typeof returnValue != "undefined" && returnValue) {
                    return props;
                }
            },
            reset: function () {
                this.videoBuffer = null;
                this.audioBuffer = null;
                this.sumBitrate = 0;
                this.sumPerceivedBandwidth = 0;
                this.sumMeasuredBandwidth = 0;
                this.downloadedChunks = 0;
                this.failedChunks = 0;
            }
        }

        //playIntervals tracks the intervals of time in which the viewer watched on
        var playIntervals = {
            startTime: options.startTime,
            endTime: 0,
            added: false,
            lastCheckedTime: 0,
            arrayOfTimes: [],
            overlappingArrayOfTimes: [],
            sorted: false,
            totalSecondsFullscreen: 0,
            previouslyReportedTotalFullscreenTime: 0,
            previouslyReportedTotalPlayTime: options.startTime,
            sortAlgorithm: function (a, b) {

                if (a[0] < b[0]) return -1;
                if (a[0] > b[0]) return 1;
                return 0;

            },
            update: function (time) {
                if (time == this.lastCheckedTime + 1) {
                    if (player.isFullscreen()) {
                        this.totalSecondsFullscreen += 1;
                    }
                }

                if ((!(time == this.lastCheckedTime || time == this.lastCheckedTime + 1)) || (metricsToTrack.timeUpdateInterval && time == lastTimeTracked)) {
                    this.endTime = this.lastCheckedTime;
                    this.push();
                    this.startTime = time;
                    this.added = false;
                }
                this.lastCheckedTime = time;
            },
            push: function () {
                this.arrayOfTimes.push([this.startTime, this.endTime]);
                this.added = true;
            },
            getOverlappingArrayOfTimes: function () {
                if (!this.added) {
                    this.endTime = Math.round(player.currentTime());
                    this.push();
                }
                this.arrayOfTimes = this.arrayOfTimes.sort(this.sortAlgorithm);


                if (this.arrayOfTimes.length > 1) {
                    this.overlappingArrayOfTimes.push(this.arrayOfTimes[0]);
                    for (var i = 1; i < this.arrayOfTimes.length; i++) {
                        if (this.arrayOfTimes[i][0] <= this.overlappingArrayOfTimes[this.overlappingArrayOfTimes.length - 1][1]) {
                            if (this.arrayOfTimes[i][1] > this.overlappingArrayOfTimes[this.overlappingArrayOfTimes.length - 1][1]) {
                                var t0 = this.overlappingArrayOfTimes[this.overlappingArrayOfTimes.length - 1][0];
                                var t1 = this.arrayOfTimes[i][1];
                                this.overlappingArrayOfTimes.pop();
                                //overlappingArrayOfTimes
                                this.overlappingArrayOfTimes.push([t0, t1]);
                            }
                        } else {
                            this.overlappingArrayOfTimes.push(this.arrayOfTimes[i]);
                        }
                    }
                } else {
                    this.overlappingArrayOfTimes = this.arrayOfTimes;
                }

                this.sorted = true;
            },
            getTotalPlayTime: function () {
                if (!this.sorted) {
                    this.getOverlappingArrayOfTimes();
                }
                var TotalPlayTime = 0;
                for (var i = 0; i < this.arrayOfTimes.length; i++) {
                    TotalPlayTime += this.arrayOfTimes[i][1] - this.arrayOfTimes[i][0];
                }
                return Math.round(TotalPlayTime);
            },
            getTotalUniquePlayTime: function () {
                if (!this.sorted) {
                    this.getOverlappingArrayOfTimes();
                }
                var TotalUniquePlayTime = 0;
                for (var i = 0; i < this.overlappingArrayOfTimes.length; i++) {
                    TotalUniquePlayTime += this.overlappingArrayOfTimes[i][1] - this.overlappingArrayOfTimes[i][0];
                }
                return Math.round(TotalUniquePlayTime);
            },
            reset: function () {

                this.startTime = 0;
                this.endTime = 0;
                this.totalSecondsFullscreen = 0;
                this.added = false;
                this.sorted = false;
                this.arrayOfTimes = [];
                this.overlappingArrayOfTimes = [];
            }
        };

        //Timer for playTime tracking for Live playback
        //Tracking totalSeconds in seconds
        var playTimeLive = {
            totalSeconds: 0,
            totalSecondsFullscreen: 0,
            previouslyReportedTotalPlayTime: 0,
            previouslyReportedTotalFullscreenTime: 0,
            start: function () {
                var self = this;
                this.interval = setInterval(function () {
                    self.totalSeconds += 1;
                    if (player.isFullscreen()) {
                        self.totalSecondsFullscreen += 1;
                    }
                }, 1000);
            },
            pause: function () {
                clearInterval(this.interval);
                delete this.interval;
            },
            resume: function () {
                if (!this.interval) this.start();
            },
            send: function (returnValue) {
                var props = { "time": this.totalSeconds };
                if (typeof returnValue != "undefined" && returnValue) {
                    return props;
                }
                else {
                    trackEvent('playTime', props);
                }
            },
            reset: function () {
                this.totalSeconds = 0;
                this.totalSecondsFullscreen = 0;
            }
        };

        var sourceset = function () {

            if (load.videoElementUsed) {
                unloadData();
            }

            //resetting state for source change scenario
            load.reset()
            buffering.fullReset();
            playTimeLive.reset();
            playIntervals.reset();
            download.reset();
            percentPlayed = 0;
            lastPercentTracked = null;
            currentProtectionInfo = null;
            streamId = null;
            if (options.debug) {
                console.log("Resetting App Insight Plugin Config");
            }
        }

        var loaded = function () {
            playerStateonPageLoad = player.isLive();

            streamId = options.streamId || dataSetupOptions.streamId || null;
            if (!streamId) {
                streamId = mapManifestUrlToId(player.currentSrc());
            }
            if (options.debug) {
                console.log("streamId set as: " + streamId);
            }

            if (player.currentProtectionInfo()) {
                currentProtectionInfo = mapProtectionInfo(player.currentProtectionInfo()[0].type);
            } else {
                currentProtectionInfo = "none";
            }

            if (options.debug) {
                console.log("protectionInfo set as: " + currentProtectionInfo);
            }


            //sending loadedmetadata event
            if (metricsToTrack.loaded) {
                trackEvent('loadedmetadata', { "time": load.loadTime });
            }

            //used to track if the video element is reused to appropriately send unload data
            load.videoElementUsed = true;

        };

        var canplaythrough = function () {
            load.updateLoadTime();
        }

        var timeupdate = function () {
            if (load.firstPlay && streamId) {
                var currentTime = Math.round(player.currentTime());

                if (metricsToTrack.playbackSummary || metricsToTrack.playTime) {
                    playIntervals.update(currentTime);
                }

                if (metricsToTrack.percentsPlayed) {
                    //Currently not tracking percentage watched information for Live
                    if (!this.isLive()) {
                        var duration = Math.round(player.duration());

                        var currentTimePercent = Math.round(currentTime / duration * 100);
                        if (currentTimePercent != lastPercentTracked) {

                            if (currentTimePercent % percentsPlayedInterval == 0 && currentTimePercent <= 100) {
                                if (__indexOf.call(percentsAlreadyTracked, currentTimePercent) < 0) {
                                    if (currentTimePercent !== 0) {
                                        percentPlayed += percentsPlayedInterval;
                                    }
                                    percentsAlreadyTracked.push(currentTimePercent);
                                }
                                trackEvent("percentReached", { "percent": currentTimePercent });
                            }
                        }
                        lastPercentTracked = currentTimePercent;
                    }

                }

                if (metricsToTrack.timeUpdateInterval) {
                    if (!this.isLive()) {

                        //console.log("current time " + currentTime + " last position " + lastPosition)
                        if (currentTime != lastPosition) {
                            if (currentTime % timeUpdateInterval == 0) {
                                // console.log('time to report' + currentTime);
                                if (__indexOf.call(timeAlreadyTracked, currentTime) < 0) {
                                    //console.log('push to array:' + currentTime);
                                    timeAlreadyTracked.push(currentTime);
                                    lastTimeTracked = currentTime;
                                    sendPlaybackSummary(false);
                                    //console.log('sent summary')
                                }
                                else {
                                    lastTimeTracked = currentTime;
                                    playIntervals.previouslyReportedTotalPlayTime = playIntervals.getTotalPlayTime();
                                    //console.log('time to report but not reporting' + currentTime + ", totalPlayTime: " + playIntervals.previouslyReportedTotalPlayTime);                                    
                                }
                            }
                            lastPosition = currentTime;
                        }
                    }
                    else {
                        var currentMediaTime = Math.round(player.currentMediaTime());

                        //console.log("currentMediaTime" + currentTime + " last position " + lastMediaTime)
                        if (currentMediaTime != lastMediaTime) {
                            if (currentMediaTime % timeUpdateInterval == 0) {
                                //console.log('time to report' + currentMediaTime);
                                if (__indexOf.call(timeAlreadyTracked, currentMediaTime) < 0) {
                                    // console.log('push to array');
                                    timeAlreadyTracked.push(currentMediaTime);
                                    lastTimeTracked = currentTime;
                                    sendPlaybackSummary(false);
                                    //console.log('sent summary')
                                }
                                else {
                                    lastTimeTracked = currentTime;
                                    playIntervals.previouslyReportedTotalPlayTime = playTimeLive.totalSeconds;
                                    //console.log('time to report but not reporting' + currentMediaTime);
                                }
                            }
                            lastMediaTime = currentMediaTime;
                        }
                    }
                }

                if (metricsToTrack.bitrateQuality || metricsToTrack.playbackSummary) {
                    if (!download.videoBuffer && player.currentDownloadBitrate()) {
                        download.completed();
                    }
                }
            }
        };

        var play = function () {
            if (metricsToTrack.play) {
                var currentTime;
                currentTime = Math.round(player.currentTime());
                trackEvent('play', { 'currentTime': currentTime });
            }
        };

        var playing = function () {
            seeking = false;
            if (!load.firstPlay) {
                load.firstPlay = true;
                if (metricsToTrack.viewed) {
                    trackEvent("viewed");
                    sendPlaybackSummary(false);
                }
            }
            if (metricsToTrack.buffering || metricsToTrack.playbackSummary) {
                buffering.send();
            }

            if (metricsToTrack.playTime || metricsToTrack.playbackSummary) {
                if (player.isLive()) {
                    if (playTimeLive.totalSeconds == 0) {
                        playTimeLive.start();
                    } else {
                        playTimeLive.resume();
                    }
                }
            }
        }


        var pause = function () {


            if (metricsToTrack.playTime || metricsToTrack.playbackSummary) {
                if (player.isLive()) {
                    playTimeLive.pause();
                }
            }

            if (metricsToTrack.pause) {
                var currentTime = Math.round(player.currentTime());
                var duration = Math.round(player.duration());

                if (currentTime !== duration && !seeking) {
                    if (metricsToTrack.pause) {
                        trackEvent('pause', { 'currentTime': currentTime });
                    }
                }
            }
        }

        var seek = function () {
            seeking = true;

            if (metricsToTrack.seek) {
                //add seekingTime
                var currentTime = Math.round(player.currentTime());
                trackEvent('seek', { 'currentTime': currentTime });
            }
        }

        var end = function () {
            if (metricsToTrack.playTime || metricsToTrack.playbackSummary) {
                if (player.isLive()) {
                    playTimeLive.pause();
                }
            }
            if (metricsToTrack.ended) {
                if (!load.endedReached) {
                    trackEvent('ended');
                    sendPlaybackSummary(false);
                    load.endedReached = true;
                }
            }
        };

        var waiting = function () {
            buffering.enterBuffering();
        }

        var downloadcompleted = function () {
            download.completed();
        }

        var downloadfailed = function () {

        }

        var fullscreen = function () {
            var currentTime = Math.round(player.currentTime());
            if ((typeof player.isFullscreen === "function" ? player.isFullscreen() : void 0) || (typeof player.isFullScreen === "function" ? player.isFullScreen() : void 0)) {
                //enter fullscreen
                trackEvent('fullscreen', { 'enter': 1, 'currentTime': currentTime });
            } else {
                //exit fullscreen
                trackEvent('fullscreen', { 'enter': 0, 'currentTime': currentTime });
            }
        };
        var triggervc = true;
        var volume;
        var volumechange = function () {
            volume = player.volume();
            if (triggervc) {
                triggervc = false;
                setTimeout(function () {
                    triggervc = true;
                    trackEvent('vc', { 'volume': volume });
                    if (volume < 0.02)
                        trackEvent('mute', { 'muted': 1 });
                }, 1000);
            }
        }
        var muteToggle = function (e) {
            trackEvent('mute', { 'muted': (player.muted() == true) ? 1 : 0 })
        }

        var captionSearch = function () {
            $("body").on('autocompleteopen', '#captionsearchinput', function (event, ui) {
                var csKeyword = $(this).val();
                if (csKeyword.length > 0)
                    trackEvent('cs', {}, { 'csKeyword': csKeyword });
                $('.amp-captionsearch-control .vjs-menu-item').click(function () {
                    trackEvent('csrc', {}, { 'csKeyword': $('#captionsearchinput').val(), 'csResult': $(this).find('span').attr('title') });
                });
            });
        }

        var linkClick = function () {
            $('body').on('click', '.mps_track', function () {
                var linkName = ($(this).attr('title') ? $(this).attr('title') : $(this).text());
                if (linkName.length == 0 && $(this).find("img").length > 0) {
                    linkName = ($(this).find("img").attr('alt') ? $(this).find("img").attr('alt') : "");
                }
                var linkUrl = ($(this).attr('href') ? $(this).attr('href') : '');
                var props = {};
                props.linkName = linkName;
                props.linkUrl = linkUrl;
                props.pageUrl = window.location.href;
                props.aitl = linkName;
                props.tu = linkUrl
                props.cg = ($(this).attr('aria-category') ? $(this).attr('aria-category') : '');
                trackEvent('lc', {}, props);
            });
        }
        var error = function () {
            if (load.loadTime == 0) {
                load.updateLoadTime();
            }

            if (metricsToTrack.playTime || metricsToTrack.playbackSummary) {
                if (player.isLive()) {
                    playTimeLive.pause();
                }
            }
            if (metricsToTrack.error) {
                var currentTime = Math.round(player.currentTime());
                var errorHexCode = player.error().code.toString(16);
                trackEvent("error", { "errorCode": errorHexCode, 'currentTime': currentTime });
            }
        };

        function exit() {
            //Check that you haven't already sent this data
            //iOS fires event twice
            if (!load.unloaddatasent) {
                load.unloaddatasent = true;
                unloadData();
            }
        };

        function sendPlaybackSummary(sendOtherEvents) {

            var totalPlayTime = playTimeLive.totalSeconds;
            var previouslyReportedTotalPlayTime = playTimeLive.previouslyReportedTotalPlayTime;
            playTimeLive.previouslyReportedTotalPlayTime = totalPlayTime;


            var totalFullscreenTime = playTimeLive.totalSecondsFullscreen;
            var previouslyReportedTotalFullscreenTime = playTimeLive.previouslyReportedTotalFullscreenTime;
            playTimeLive.previouslyReportedTotalFullscreenTime = totalFullscreenTime;

            var totalPercentViewed = Math.min(percentPlayed, 100);
            //var totalUniquePlayTime = totalPlayTime;

            if (!player.isLive()) {
                totalPlayTime = playIntervals.getTotalPlayTime();
                previouslyReportedTotalPlayTime = playIntervals.previouslyReportedTotalPlayTime;
                playIntervals.previouslyReportedTotalPlayTime = totalPlayTime;

                totalFullscreenTime = playIntervals.totalSecondsFullscreen;
                previouslyReportedTotalFullscreenTime = playIntervals.previouslyReportedTotalFullscreenTime;
                playIntervals.previouslyReportedTotalFullscreenTime = totalFullscreenTime;

                totalPercentViewed = Math.min(Math.round((playIntervals.getTotalUniquePlayTime() / player.duration()) * 100), 100);

                //totalUniquePlayTime = playIntervals.getTotalUniquePlayTime();

            }

            if (load.loadTime == 0) {
                load.updateLoadTime();
            }


            //send events
            if (sendOtherEvents) {
                var unloadMetrics = {
                    "percentPlayed": percentPlayed,
                    'rebufferCount': buffering.count,
                    "totalRebufferTime": buffering.bufferingTimeTotal
                }
                $.extend(unloadMetrics, buffering.send(true));
                $.extend(unloadMetrics, playTimeLive.send(true));
                $.extend(unloadMetrics, download.send(true));

                trackEvent("unload", unloadMetrics);

            }
            else if (load.firstPlay && metricsToTrack.playbackSummary) {
                var playbackSummaryMetric = {
                    "playTime": totalPlayTime,
                    "currentPlayTime": totalPlayTime - previouslyReportedTotalPlayTime,
                    "fullscreenTime": totalFullscreenTime,
                    "currentFullScreenTime": totalFullscreenTime - previouslyReportedTotalFullscreenTime,
                    "rebufferCount": buffering.count,
                    "rebufferTime": buffering.bufferingTimeTotal
                }
                //console.log("Current PlayTime:" + playbackSummaryMetric.currentPlayTime + ", playTime:" + playbackSummaryMetric.playTime);
                if (load.loadTime <= 100000) {
                    //removing outliers when loadTime cannot be properly calculated because browser doesn't accurately call events
                    playbackSummaryMetric.loadTime = load.loadTime;
                }
                if (!player.isLive()) {
                    playbackSummaryMetric.percentPlayed = totalPercentViewed;
                }

                if (download.downloadedChunks > 0) {
                    var avgBitrate = Math.round(download.sumBitrate / download.downloadedChunks);
                    var avgMeasuredBandwidth = Math.round(download.sumMeasuredBandwidth / download.downloadedChunks);
                    var avgPerceivedBandwidth = Math.round(download.sumPerceivedBandwidth / download.downloadedChunks);

                    playbackSummaryMetric.avgBitrate = avgBitrate;
                    playbackSummaryMetric.avgMeasuredBandwidth = avgMeasuredBandwidth;
                    playbackSummaryMetric.avgPerceivedBandwidth = avgPerceivedBandwidth;

                }

                if (download.videoBuffer) {
                    playbackSummaryMetric.failedDownloads = download.failedChunks;
                }
                if (player.error()) {
                    playbackSummaryMetric.errorCode = player.error().code.toString(16);
                }
                trackEvent("pbs", playbackSummaryMetric);
            }
        }


        function unloadData() {
            try {
                // trackEvent("playbackSummary", {});
                //appInsights.trackEvent("userLeft", {}, {});
                var ps = getPlayerState(); //To test with Live event and enable if we need to enable Local Storage only in VOD mode. 
                if (ps == 0 && options.otherAIProps && options.otherAIProps.mpsChannel && options.otherAIProps.mpsEventId) {
                    updateTrackedInterval(options.otherAIProps.mpsChannel + options.otherAIProps.mpsEventId, timeAlreadyTracked, percentsAlreadyTracked);
                }
                sendPlaybackSummary(true);
                appInsights.flush();
            }
            catch (ex) { }
        }
        function getQuerystring(key, default_, _url) {
            if (typeof _url === "undefined") {
                _url = window.location.href
            }
            if (default_ == null) default_ = "";
            key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
            var qs = regex.exec(_url.toLowerCase());
            if (qs == null)
                return default_;
            else
                return qs[1];
        }
        var getPlayerState = function () {
            var playerMode;
            //0 - vod, 1 - live, 2 - dvr
            if (playerStateonPageLoad && player.isLive()) { //live
                var liveflag = true;
                var scode = getQuerystring('scode', '');
                if (scode.length == 0 && typeof dynamicsession.json !== 'undefined' && dynamicsession.json[options.sessioncode]) {
                    var now = new Date();
                    var utcNow = new Date(now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/' + now.getUTCDate() + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes());
                    if (!(utcNow.getTime() <= dynamicsession.json[options.sessioncode].end)) {
                        liveflag = false;
                    }
                }
                if (liveflag) {
                    playerMode = 1;
                }
                else {
                    playerMode = 0;
                }
            }
            else if (playerStateonPageLoad && !player.isLive()) { //dvr
                var liveflag = false;
                var scode = getQuerystring('scode', '');
                if (scode.length > 0) {
                    liveflag = true;
                }
                else {
                    if (typeof dynamicsession.json !== 'undefined' && dynamicsession.json[options.sessioncode]) {
                        var now = new Date();
                        var utcNow = new Date(now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/' + now.getUTCDate() + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes());
                        if (utcNow.getTime() <= dynamicsession.json[options.sessioncode].end) {
                            liveflag = true;
                        }
                    }
                }
                if (liveflag) {
                    playerMode = 1;
                }
                else {
                    playerMode = 0;
                }
            }
            else
                playerMode = 0;
            return playerMode;
        }

        var GetDynamicMpsEventId = function (staticMpsEventId) {
            var sessionMetadata = { mpsEventId: staticMpsEventId };
            try {
                if (typeof dynamicsession.json !== "undefined") {
                    var scode = getQuerystring('scode', '').toUpperCase();
                    if (playmaker.options.currentSessioncode && playmaker.options.currentSessioncode.length > 0 && playmaker.options.currentSessioncode !== options.otherAIProps.mpsEventId) {
                        sessionMetadata.mpsEventId = playmaker.options.currentSessioncode;
                        sessionMetadata.stype = dynamicsession.json[sessionCode.mpsEventId].stype;
                        sessionMetadata.sproduct = dynamicsession.json[sessionCode.mpsEventId].sproduct;
                        sessionMetadata.strack = dynamicsession.json[sessionCode.mpsEventId].strack;
                        sessionMetadata.stitle = dynamicsession.json[sessionCode.mpsEventId].stitle;
                    }
                    else if (scode.length > 0) {
                        sessionMetadata.mpsEventId = scode;
                        sessionMetadata.stype = dynamicsession.json[scode].stype;
                        sessionMetadata.sproduct = dynamicsession.json[scode].sproduct;
                        sessionMetadata.strack = dynamicsession.json[scode].strack;
                        sessionMetadata.stitle = dynamicsession.json[scode].stitle;
                    }
                    else {
                        if (dynamicsession.json.config.absolutetime) {
                            var pt = getPlayerAbsoluteTime(dynamicsession.json.config);
                        }
                        else {
                            var pt = getPlayerMediaTime(dynamicsession.json.config);
                        }
                        $.each(dynamicsession.json, function (key, val) {
                            if (pt >= val.st && pt < val.et) {
                                if (val.scode) {
                                    sessionMetadata.mpsEventId = val.scode;
                                }
                                else {
                                    sessionMetadata.mpsEventId = key;
                                }
                                sessionMetadata.stype = val.stype;
                                sessionMetadata.sproduct = val.sproduct;
                                sessionMetadata.strack = val.strack;
                                sessionMetadata.stitle = val.stitle;
                            }
                        });
                    }

                }
                options.sessioncode = sessionMetadata.mpsEventId;
                return sessionMetadata;
            }
            catch (ex) {
                return sessionMetadata;
            }
        }
        var UpdateVideoStart = function (shortCode) {
            try {
                if (!viewedSessionList[shortCode]) {
                    viewedSessionList[shortCode] = "1";
                    setTimeout(function () {
                        var registrantKey = getQuerystring("uid");
                        if (registrantKey != null && registrantKey.length > 0 && shortCode != null && playmaker.options.config && playmaker.options.config.enableSessionScan) {
                            var channelKey = shortCode.toUpperCase().split('-')[0];
                            var regId = registrantKey;
                            registrantKey = null;

                            $.ajax({
                                url: "https://medius.studios.ms/VideoStartNotifications/UpdateVideoStart",
                                //data: "{ 'ShortCode': '" + shortCode + "', 'ChannelKey': '" + channelKey + "', 'RegistrantKey': '" + registrantKey + "', 'Scantype':'" + options.scanType + "'}",
                                data: "{ 'ShortCode': '" + shortCode + "', 'ChannelKey': '" + channelKey + "', 'RegistrantKey': '" + registrantKey + "', 'Scantype':'" + "LiveStream" + "' , 'RegId': '" + regId + "'}",
                                dataType: "json",
                                type: "POST",
                                contentType: "application/json; charset=utf-8",
                                success: function (data) {
                                    //console.log(data + " Video Start Informed");
                                },
                                failure: function (response) {
                                    // console.log(response + "Something went wrong");
                                }
                            });
                        }
                    }, 300000) //5min 300000
                }

            }
            catch (ex) { }
        }
        var clearTitleInterval = setInterval(function () {
            var $dt = $("#dynamictitle");
            if ($dt.is(":visible")) {
                var currentTime = new Date().getTime();
                if (parseInt($dt.data('expires')) <= currentTime) {
                    console.log("hidden");
                    $dt.hide();
                }
            }
        }, 1000);
        var trackEvent = function (event, metricsObj, addlProps) {

            if (window.appInsights) {
                var properties = {
                    event: event,
                    cid: getQuerystring('wt.mc_id', '') || getQuerystring('cid', '') || getQuerystring('ocid', '') || getQuerystring('icid', '') || '',
                    ru: decodeURIComponent(getQuerystring('ru', '')).substring(0, 1024) || getQuerystring('referrer', '').substring(0, 1024) || document.referrer.substring(0, 1024) || '',
                    PlaybackTech: player.currentTechName() || "unknown",
                    MimeType: player.currentType() || "unknown",
                    ProtectionType: currentProtectionInfo || "unkown",
                    isLive: player.isLive() ? "live" : "vod" || "unknown"
                };
                var mhid = getQuerystring('mhid', '');
                if (mhid.length > 0) {
                    properties.mhid = mhid;
                }
                var uid = getQuerystring('uid', '');
                if (uid.length > 0) {
                    properties.uid = uid;
                }

                if (options.hasOwnProperty("dateDifference")) {
                    properties.dd = options.dateDifference;
                }

                if (properties.cid.length === 0) {
                    properties.cid = decodeURIComponent(getQuerystring('wt.mc_id', '', properties.ru) || getQuerystring('cid', '', properties.ru) || getQuerystring('ocid', '', properties.ru) || getQuerystring('icid', '', properties.ru) || '');
                }
                $.extend(properties, options.otherAIProps);

                var sessionMetadata = GetDynamicMpsEventId(properties.mpsEventId);
                var scode1 = getQuerystring('scode1', '').toUpperCase();
                if (prevSessionCode.length === 0) {
                    prevSessionCode = sessionMetadata.mpsEventId;
                }
                else if (prevSessionCode.length > 0 && sessionMetadata.mpsEventId !== prevSessionCode) {
                    try {
                        if (scode1 === prevSessionCode.toUpperCase()) {
                            window.parent.postMessage({ type: "sessionend", data: { sessionCode: prevSessionCode } }, "*");
                            console.log(prevSessionCode);
                        }
                        prevSessionCode = sessionMetadata.mpsEventId;
                        if (dynamicsession.titleDisplay && sessionMetadata.stitle && sessionMetadata.stitle.length > 0) {
                            options.sessiontitles.push(sessionMetadata.stitle);
                            setTimeout(function () {
                                if (options.sessiontitles.length === 1) {
                                    var $dt = $("#dynamictitle");
                                    $dt.find(".dt-sessiontitle").html(options.sessiontitles[0]);
                                    var currentTime = new Date().getTime();
                                    $dt.data("expires", currentTime + (dynamicsession.titleDisplayDuration * 1000));
                                    $dt.show();
                                    options.sessiontitles.splice(0, 1);
                                }
                                else if (options.sessiontitles.length > 1) {
                                    options.sessiontitles.splice(0, 1);
                                }

                            }, 5000)
                        }
                    }
                    catch (ex) { }
                }
                if (scode1.length > 0) {
                    sessionMetadata.mpsEventId = scode1;
                }
                if (dynamicsession.sessioncodeDisplay) {
                    if (dynamicsession.sessioncodeEl) {
                        dynamicsession.sessioncodeEl.html(sessionMetadata.mpsEventId);
                    }
                    else {
                        $(options.playerId).append('<div id="dynamicsessioncode""></div>');
                        dynamicsession.sessioncodeEl = $("#dynamicsessioncode");
                    }
                }
                $.extend(properties, sessionMetadata);

                properties.ps = getPlayerState();
                if (typeof addlProps == 'undefined') {
                    addlProps = {};
                }
                $.extend(properties, addlProps);

                //properties = $.extend(properties, addlProps);
                //additional logic incase loadedmetadata event hasn't fired to set streamId
                properties.StreamId = streamId || "unknown";
                if (event !== 'pbs') {
                    properties.PluginVersion = pluginVersion;
                    properties.PlayerVersion = player.getAmpVersion() || "unknown";

                    if (!streamId) {
                        var sourceManifest = "unknown";
                        if (player.options_.sourceList[0]) {
                            sourceManifest = player.options_.sourceList[0].src.split("//")[1];
                            if (sourceManifest.match(/.ism\/manifest/i)) {
                                sourceManifest = sourceManifest.split(/.ism\/manifest/i)[0] + ".ism/manifest";
                            }
                        }
                        properties.StreamId = sourceManifest;

                    }
                }
                if (typeof currentDistro != "undefined") {
                    properties.cdn = currentDistro;
                }

                //additional logic incase loadedmetadata event hasn't fired to set protetction info
                if (!currentProtectionInfo) {
                    var protectionInfo = "unknown";
                    if (player.options_.sourceList[0]) {
                        if (player.options_.sourceList[0].protectionInfo) {
                            protectionInfo = mapProtectionInfo(player.options_.sourceList[0].protectionInfo[0].type);
                        } else {
                            protectionInfo = "none";
                        }
                    }
                    properties.ProtectionType = protectionInfo;
                }

                if (trackSdn) {
                    properties.Sdn = player.options_.sdn.name || "none";
                }

                var metrics = metricsObj || {};
                $.each(metrics, function (key, val) {
                    if (isNaN(val)) {
                        metrics[key] = -99;
                    }
                });

                properties.cookie = navigator.cookieEnabled ? 1 : 0;

                try {
                    properties.mpsSessionId = options.mpsSessionId;
                    properties.mpsEventTime = new Date().toISOString();
                    properties.mpsSequence = options.mpsSequence++;
                    properties.ampct = player.currentTime().toFixed();
                    if (typeof player.currentAbsoluteTime() !== "undefined") {
                        properties.ampcat = player.currentAbsoluteTime().toFixed();
                    }
                    if (typeof player.currentMediaTime() !== "undefined") {
                        properties.ampcmt = player.currentMediaTime().toFixed();
                    }

                } catch (ex) { }
                if (properties.event == "pbs") {
                    UpdateVideoStart(properties.mpsEventId);
                }
                try {
                    appInsights.trackEvent(event, properties, metrics);
                }
                catch (ex) {
                    if (options.debug) {
                        console.log("Error in AI's track event.");
                    }
                }

                trackJSLLEvent(event, properties, metrics);


                if (options.debug) {
                    console.log("sent to Application Insights...'event': " + event + "\n'properties': " + JSON.stringify(properties) + "\n'metrics': " + JSON.stringify(metrics));
                }

                if (event == "error") {
                    properties.errorMessage = player.error().message;

                    appInsights.trackTrace(event, properties, metrics);
                    if (options.debug) {
                        console.log("sent to Application Insights Error Trace...'message': " + event + "\n'properties': " + JSON.stringify(properties) + "\n'metrics': " + JSON.stringify(metrics));
                    }

                }
            } else if (options.debug) {
                console.log("App Insights not detected");
            }
        }

        var trackJSLLEvent = function (event, properties, metrics) {
            //if (window.appInsights)
            try {
                var behaviour;
                switch (event) {
                    case "loadedmetadata":
                        behaviour = "VIDEPLAYERLOAD";
                        break;
                    case "viewed":
                        behaviour = "VIDEOSTART";
                        break;
                    case "pause":
                        behaviour = "VIDEOPAUSE";
                        break;
                    case "play":
                        behaviour = "VIDEOCONTINUE";
                        break;
                    case "ended":
                        behaviour = "VIDEOCOMPLETE";
                        break;
                    case "fullscreen":
                        if (metrics.enter && metrics.enter == 1) {
                            behaviour = "VIDEOFULLSCREEN";
                        }
                        else if (metrics.enter && metrics.enter == 0) {
                            behaviour = "VIDEOUNFULLSCREEN";
                        }
                        break;
                    case "buffering":
                        behaviour = "VIDEOBUFFERING";
                        break;
                    case "captions":
                        behaviour = "OTHER";
                        break;
                    case "mutetoggle":
                        if (metrics.muted && metrics.muted == 1) {
                            behaviour = "VIDEOMUTE";
                        }
                        else if (metrics.muted && metrics.muted == 0) {
                            behaviour = "VIDEOUNMUTE";
                        }
                        break;
                    case "captionsearch":
                        behaviour = "OTHER";
                        break;
                    case "audiotracks":
                        behaviour = "OTHER";
                        break;
                    case "downloadFailed":
                        behaviour = "VIDEOERROR";
                        break;
                    case "error":
                        behaviour = "VIDEOERROR";
                        break;
                    default:
                        behaviour = "OTHER";
                        break;
                }

                for (var key in metrics) {
                    if (metrics.hasOwnProperty(key)) {
                        properties[key] = metrics[key];
                    }
                }
                //properties =  $.extend(properties, metrics);
                if (properties.hasOwnProperty("mpsEventId")) {
                    properties.vidnm = properties.mpsEventId;
                }
                if (properties.hasOwnProperty("percentPlayed")) {
                    properties.vidpct = properties.percentPlayed;
                }
                if (properties.hasOwnProperty("playTime")) {
                    properties.vidwt = properties.playTime
                }
                if (properties.hasOwnProperty("ps") && properties.ps == 0) {
                    properties.viddur = player.duration();
                }
                if (properties.hasOwnProperty("cid")) {
                    properties.campaignid = properties.cid;
                }
                //Added to compare metrics between AI and JSLL
                try {
                    properties.aiuser = appInsights.context.user.id;
                    properties.aisession = appInsights.context._sessionManager.automaticSession.id;
                }
                catch (ex) { }
                contentFields = {
                    field1: properties.mhid, // host id
                    field2: properties.mpsSourceId,  // Source Id (Medius/MPSLExt/YouTube)                 
                    field3: properties.mpsEventId, //Session ShortCode
                    field4: properties.event, //action name (viewed/pbs)
                    field5: properties.ps  // Session Mode (Live/VOD)
                }
                if (properties.stype) {
                    contentFields.field6 = properties.stype; // session type (Keynote/Breakout)
                }
                if (properties.strack) {
                    contentFields.field7 = properties.strack; // session track (Sponsor/Industry)
                }
                if (properties.sproduct) {
                    contentFields.field8 = properties.sproduct; //Session Product (Office 365)
                }
                $.extend(properties, contentFields);

                properties.is1ds = 1;
                properties.id = customUserConfig.newId();
                
                var overrideValues = {
                    behavior: behaviour,
                    actionType: "CL",
                    // content: contentFields,
                    contentTags: properties,
                    //pageTags: {}
                };
                mpsonedsanalytics.capturePageAction(null, overrideValues);

                //Post events to Parent Page
                try {
                    window.parent.postMessage({ type: "jsll", data: overrideValues }, "*");
                }
                catch (ex) { }

            }
            catch (ex) {
                try {
                    appInsights.trackEvent("jsllerror", properties);
                    if (options.debug) {
                        console.log(ex.stack);
                    }
                }
                catch (ex) { }
            }
        }

        //add event listeners for tracking
        player.addEventListener("sourceset", sourceset);
        player.addEventListener("loadedmetadata", loaded);
        player.addEventListener("canplaythrough", canplaythrough);
        player.addEventListener("mute", function () { muteToggle(); });
        player.addEventListener("unmute", function () { muteToggle(); });


        if (metricsToTrack.bitrateQuality || metricsToTrack.downloadInfo || metricsToTrack.playbackSummary) {
            //does this double send on a change source?
            player.addEventListener("loadedmetadata", function () {
                dynamicsession.firsttimePlay = false;
                download.videoBuffer = player.videoBufferData();
                if (download.videoBuffer) {
                    download.videoBuffer.addEventListener("downloadcompleted", function () { download.completed() });
                    download.videoBuffer.addEventListener("downloadfailed", function () { download.failed("video") });

                }
                download.audioBuffer = player.audioBufferData();
                if (download.audioBuffer) {
                    download.audioBuffer.addEventListener("downloadfailed", function () { download.failed("audio") });
                }
            });
        }

        if (metricsToTrack.percentsPlayed || metricsToTrack.bitrateQuality || metricsToTrack.playbackSummary || metricsToTrack.playTime) {
            player.addEventListener("timeupdate", timeupdate);
        }

        player.addEventListener("playing", playing);
        if (metricsToTrack.playTime || metricsToTrack.bitrateQuality || metricsToTrack.playbackSummary) {
            window.addEventListener("beforeunload", exit, false);
            window.addEventListener("pagehide", exit, false);
            //check dispose to send data
            player.tempDispose = player.dispose;
            player.dispose = function () {
                unloadData();
                player.tempDispose();
            }
        }
        if (metricsToTrack.error || metricsToTrack.playTime || metricsToTrack.playbackSummary) {
            player.addEventListener("error", error);
        }
        if (metricsToTrack.end || metricsToTrack.playTime || metricsToTrack.playbackSummary) {
            player.addEventListener("ended", end);
        }
        if (metricsToTrack.play) {
            player.addEventListener("play", play);
        }
        if (metricsToTrack.pause || metricsToTrack.playTime || metricsToTrack.buffering || metricsToTrack.playbackSummary) {
            player.addEventListener("pause", pause);
        }
        if (metricsToTrack.buffering || metricsToTrack.playbackSummary) {
            player.addEventListener("waiting", waiting);
        }
        if (metricsToTrack.buffering || metricsToTrack.seek || metricsToTrack.playbackSummary) {
            player.addEventListener("seeked", seek);
        }
        if (metricsToTrack.fullscreen) {
            player.addEventListener("fullscreenchange", fullscreen);
        }
        if (metricsToTrack.volumechange) {
            player.addEventListener("volumechange", volumechange);
        }
        //if (metricsToTrack.mutetoggle) {
        //    $(".vjs-volume-menu-button").click(function () { muteToggle(); });
        //}
        if (metricsToTrack.captionsearch) {
            captionSearch();
        }

        if (metricsToTrack.linkclick) {
            linkClick();
        }

        if (metricsToTrack.audiotracks) {
            var audiotracksCheckCount = 0
            audiotracksInterval = setInterval(function () {
                var audiotracksLinks = document.querySelectorAll(".amp-audiotracks-control .vjs-menu-item");
                if (audiotracksLinks.length > 0) {
                    for (var i = 0; i < audiotracksLinks.length; i++) {
                        clearInterval(audiotracksInterval);
                        audiotracksLinks[i].addEventListener("mousedown", function () {
                            trackEvent('at', {}, { language: $(this).text() });
                        });
                    }
                }
                else if (audiotracksCheckCount < 120) //Check for ten minutes
                {
                    audiotracksCheckCount++;
                }
                else {
                    clearInterval(audiotracksInterval);
                }
            }, 5000);
        }

        $('body').on("click", ".vjs-asl-button .vjs-menu-item", function () {
            try {
                var $this = $(this);
                var text = $this.text().trim();
                var controltext = $this.find(".vjs-control-text").text();
                text = text.replace(controltext, '')
                var props = {};
                props.linkName = text;
                props.aitl = text;
                props.cg = "ASL";
                trackEvent('lc', {}, props);
            }
            catch (ex) { }

        });

        if (metricsToTrack.captions) {
            var captionclickevent = function ($this) {
                var language = $this.text().trim();
                var controltext = $this.find(".vjs-control-text").text();
                language = language.replace(controltext, '');
                if (language.toLowerCase().indexOf("settings") === -1) {
                    trackEvent('cc', {}, { language: language, aitl: language, cg: "Caption" });
                }
            }
            $('body').on("mousedown", ".amp-closedcaption-control .vjs-menu-item", function () {
                captionclickevent($(this));
            });
            $('body').on("touchstart", ".amp-closedcaption-control .vjs-menu-item", function () {
                captionclickevent($(this));
            });

            $('body').on("mousedown", ".amp-subtitles-control .vjs-menu-item", function () {
                captionclickevent($(this));
            });

            $('body').on("touchstart", ".amp-subtitles-control .vjs-menu-item", function () {
                captionclickevent($(this));
            });
        }
    });

}).call(this);



//customUser config
customUserConfig = {
    options: {
        duration: 7,
        name: 'ai_customUser'
    },
    pbs: {
        pbsInterval: 'ai_pbsInterval',
        duration: 7
    }
};

//Generate custom Userid - copied from appInsights code
customUserConfig.newId = function () {
    for (var t = "", n = Math.random() * 10737418240, i; n > 0;)
        i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(n % 64), t += i, n = Math.floor(n / 4);
    return t;
}
customUserConfig.newId = function () {
    for (var t = "", n = Math.random() * 10737418240125452345, i; n > 0;)
        i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(n % 64), t += i, n = Math.floor(n / 4); 
    return t;
}
customUserConfig.getCustomUserId = function () {
    var customId = '';
    if (appInsights.context.user.authenticatedId) {
        customId = appInsights.context.user.authenticatedId;
    }
    else if (window.localStorage) {
        var userStorage = localStorage.getItem(customUserConfig.options.name),
            customUser = (userStorage != null) ? JSON.parse(userStorage) : {};
        //Generate new id for new and not opened for n days
        if (!(customUser.userId && new Date(customUser.expires) > new Date())) {
            customUser.userId = customUserConfig.newId();
        }
        customUser.expires = customUserConfig.addDays(customUserConfig.options.duration).toString();
        customUserConfig.options.id = customUser.userId;
        localStorage.setItem(customUserConfig.options.name, JSON.stringify(customUser));
        customId = customUser.userId;
    }
    return customId;
}
customUserConfig.addDays = function (days) {
    date = new Date();
    /* 24 hours * 60 mins * 60 secs * 1000 ms */
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    return date;
}

function ReadTrackedInterval(name) {
    var pbsTrackedInterval = {
        playTime: [],
        playPercentage: []
    }
    try {
        if (window.localStorage) {
            var pbsInterval = localStorage.getItem(customUserConfig.pbs.pbsInterval);
            if (pbsInterval != null) {
                pbsInterval = JSON.parse(pbsInterval);
                if (pbsInterval[name]) {
                    var alreadyTracked = pbsInterval[name];
                    if (alreadyTracked.playTime) {
                        pbsTrackedInterval.playTime = alreadyTracked.playTime;
                    }
                    if (alreadyTracked.playPercentage) {
                        pbsTrackedInterval.playPercentage = alreadyTracked.playPercentage;
                    }
                }
            }
        }
    }
    catch (ex) { }
    return pbsTrackedInterval;
}

function updateTrackedInterval(name, playTime, playPercentage) {
    try {
        if (window.localStorage) {
            var pbsInterval = localStorage.getItem(customUserConfig.pbs.pbsInterval);
            if (pbsInterval == null) {
                pbsInterval = {}
            }
            else {
                pbsInterval = JSON.parse(pbsInterval);
            }
            pbsInterval[name] = {
                playTime: playTime,
                playPercentage: playPercentage,
                expires: customUserConfig.addDays(customUserConfig.pbs.duration)
            }
            updateLocalStorageForTrackedInterval(pbsInterval, 0);
        }
    }
    catch (ex) { }
}
var retryCountLS = 0
function updateLocalStorageForTrackedInterval(pbsInterval, noOfDays) {
    try {
        $.each(pbsInterval, function (key, item) {
            if (item.expires && new Date(item.expires) < customUserConfig.addDays(noOfDays)) {
                delete pbsInterval[key];
            }
        });
        window.localStorage.setItem(customUserConfig.pbs.pbsInterval, JSON.stringify(pbsInterval));
    }
    catch (ex) {
        if (ex.message == "QuotaExceededError" && retryCountLS < customUserConfig.pbs.duration) {
            retryCountLS++;
            updateLocalStorageForTrackedInterval(pbsInterval, retryCountLS);
        }
    }
}
function getInstrumentationKey() {
    var key = "a948d59d-3467-43e2-8827-40a4d31f4014";
    try {
        var localStorageKey = localStorage.getItem('ai_instrumentationKey');
        var key = (localStorageKey != null) ? localStorageKey : retrieveKey();
    }
    catch (ex) {
    }
    return key;
}

function retrieveKey() {
    var key = "90eeeda4-78f7-498a-96c7-4b622f8f57be";
    var key2 = "a948d59d-3467-43e2-8827-40a4d31f4014";
    if ((Math.round(Math.random() * 10)) % 2 == 1) {
        key = key2;
    }
    return key;
}

mpsClickTrack = function ($this, properties) {
    try {
        var linkName = ($this.attr('title') ? $this.attr('title') : $this.text());
        if (linkName.length == 0 && $this.find("img").length > 0) {
            linkName = ($this.find("img").attr('alt') ? $this.find("img").attr('alt') : "");
        }
        var linkUrl = ($this.attr('href') ? $this.attr('href') : '');
        var props = properties;
        props.linkName = linkName;
        props.linkUrl = linkUrl;
        props.pageUrl = window.location.href;
        props.aitl = linkName;
        props.tu = linkUrl
        props.cg = ($this.attr('data-category') ? $this.attr('data-category') : '');
        appInsights.trackEvent('lc', props);
        var overrideValues = {
            behavior: awa.behavior.OTHER,
            actionType: "CL",
            contentTags: props,
            pageTags: {}
        };
        awa.ct.captureContentPageAction(overrideValues);
    }
    catch (ex) { }
}