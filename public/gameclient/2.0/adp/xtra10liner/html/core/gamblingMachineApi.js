/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright © edict egaming GmbH, Hamburg (Germany) [2015]
 */

 /* -------------------------------------------------------- */
 /*                                                          */
 /*         Gambling Machine API                               */
 /*         Version: 7.1                           */
 /*         BuildVersion:  ${buildNumber}                    */
 /*                                                          */
 /* -------------------------------------------------------- */


"use strict";

var ECG = ECG || {};
ECG.impl = ECG.impl || {};
ECG.api = ECG.api || {};
ECG.impl.createApiGamblingMachineEnvironment = function () {

    parent.XCG.info.generateDelegate('7.1');
    var gamblingMachineEnvironment = {};

    /**
     * Calls startCallback when system is prepared.
     * <p/>
     * The startCallback should contain the logic to start the game.
     * The commandCallback is executed when called from outside of the game.
     * The commandCallback should contain the logic to handle the commands, given to the commandCallback as a parameter.
     * The commands, the game should be able handle are:
     * - 'pause': This command should pause the game.
     * - 'resume': This command should continue the game, if it was paused.
     * - 'disableAudio'
     * - 'enableAudio'
     * - 'updateDepot'
     * <p/>
     * In game manufacturer's index.html it should be written like this
     * <body onload="ECG.api.gamblingMachineEnvironment.onPrepared.onPrepared(YOUR_GAME.start, YOUR_GAME.command)">
     *
     * @param startCallback  contains the start-game-logic
     * @param commandCallback contains the game-logic to handle external game commands (e.g 'pause', 'resume')
     * @param resizeCallback contains the functionality to resize the gameclient (parameters: x and y in pixels)
     */
    gamblingMachineEnvironment.onPrepared = function (startCallback, commandCallback, resizeCallback) {
        parent.XCG.delegate.gamblingMachineEnvironment.onPrepared(startCallback, commandCallback, resizeCallback);
    };

    return gamblingMachineEnvironment;
};

ECG.impl.createApiGamblingMachineService = function () {
    var gamblingMachineService = {};


    gamblingMachineService.updateBalance = function () {
        parent.XCG.delegate.gamblingMachineService.updateBalance();
    };

    /**
     * Starts the javascript-core-engine.
     * <p/>
     * The GamblingMachine backend will be initialized and started.
     *
     * @return game data from GamblingMachine backend for initialization for the game client
     */
    gamblingMachineService.start = function () {
        return parent.XCG.delegate.gamblingMachineService.start();
    };


    gamblingMachineService.stop = function () {
        parent.XCG.delegate.gamblingMachineService.stop();
    };

    gamblingMachineService.send = function (gameData, callback, synchron) {
        parent.XCG.delegate.gamblingMachineService.send(gameData, callback, synchron);
    };


    /**
     * Returns the full depot balance.
     * @returns {number}
     */
    gamblingMachineService.getDepotBalance = function () {
        return parent.XCG.delegate.gamblingMachineService.getDepotBalance();
    };

    /**
     * Returns the limited depot balance.
     * needs to be shown by the gameclient seperately when value differs from
     * the value which getDepotBalance returns
     * @returns {number}
     */
    gamblingMachineService.getLimitedDepotBalance = function () {
        return parent.XCG.delegate.gamblingMachineService.getLimitedDepotBalance();
    };

    /**
     * Stored suppressed messages will be shown.
     * <p/>
     * When new messages arrived from server, they will not be shown because of misunderstanding situations for the player.
     * For example the message told no money left but the loosing animation was not presented yet.
     * That would cause confusion on the player side.
     * <p/>
     * The game client must call this method from time to time.
     * @param resumeCallback Function handle which will be called by the core if the game can resume game play
     */
    gamblingMachineService.showSuppressedCasinoMessages = function (resumeCallback) {
        parent.XCG.delegate.gamblingMachineService.showSuppressedCasinoMessages(resumeCallback);
    };

    /**
     * Request minimization of the Client. This is only possible, if client is maximized.
     * After size change is completed, the resizeCallback will be called.
     */
    gamblingMachineService.minimizeClient = function () {
        parent.XCG.delegate.gamblingMachineService.minimizeClient();
    };

    /**
     * Request maximization of the Client. This is only possible, if client is minimized.
     * After size change is completed, the resizeCallback will be called.
     */
    gamblingMachineService.maximizeClient = function () {
        parent.XCG.delegate.gamblingMachineService.maximizeClient();
    };

    /**
     * Must be called when the animation of a new game round has been started
     * to inform the portal environment about that.
     */
    gamblingMachineService.gameRoundStarted = function () {
        parent.XCG.delegate.gamblingMachineService.gameRoundStarted();
    };

    /**
     * Must be called when the animation of a game round has been ended
     * to inform the portal environment about that.
     */
    gamblingMachineService.gameRoundEnded = function () {
        parent.XCG.delegate.gamblingMachineService.gameRoundEnded();
    };

    /**
     * Must be called when the stake has been updated to inform the portal environment about that.
     * @param value
     */
    gamblingMachineService.stakeUpdated = function (value) {
        parent.XCG.delegate.gamblingMachineService.stakeUpdated(value);
    };

    /**
     * Must be called when the win sum has been updated to inform the portal environment about that.
     * @param value
     */
    gamblingMachineService.winUpdated = function (value) {
        parent.XCG.delegate.gamblingMachineService.winUpdated(value);
    };

    /**
     * Must be called when the user has unmuted the sound
     */
    gamblingMachineService.audioEnabled = function () {
        parent.XCG.delegate.gamblingMachineService.audioEnabled();
    };

    /**
     * Must be called when the user has muted the sound
     */
    gamblingMachineService.audioDisabled = function () {
        parent.XCG.delegate.gamblingMachineService.audioDisabled();
    };

    /**
     * Requests the logout of the current player from the portal
     * @param reason Optional reason for log out.
     */
    gamblingMachineService.logoutPortalUser = function (reason) {
        parent.XCG.delegate.gamblingMachineService.logoutPortalUser(reason);
    };

    /**
     * Requests to present the ResponsibleGamingUrl from the portal
     * */
    gamblingMachineService.openResponsibleGamingUrl = function () {
        parent.XCG.delegate.gamblingMachineService.openResponsibleGamingUrl();
    };

    /**
     * Show abortion message and close game client.
     * </p>
     * This function should be called if
     * - resources could not be loaded
     * - unexpected errors occurred
     */
    gamblingMachineService.abortGame = function () {
        parent.XCG.delegate.gamblingMachineService.abortGame();
    };

    /**
     * set for gameClientSizeChangedCallback
     * @deprecated should not be called by the game and will be removed in upcoming version
     * @param sizeChangedCallback Callback given by game during onPrepared
     */
    gamblingMachineService.setSizeChangedCallback = function (sizeChangedCallback) {
        parent.XCG.delegate.gamblingMachineService.setSizeChangedCallback(sizeChangedCallback);
    };

    /**
     * set for CommandCallback
     * @deprecated should not be called by the game and will be removed in upcoming version
     * @param commandCallback Callback given by game during onPrepared
     */
    gamblingMachineService.setCommandCallback = function (commandCallback) {
        parent.XCG.delegate.gamblingMachineService.setCommandCallback(commandCallback);
    };

    /**
     * Sends the given command to the game via the actionCommandCallback.
     * @deprecated should not be called by the game and will be removed in upcoming version
     * @param {string} command Command name to send
     */
    gamblingMachineService.sendCommandToGame = function (command) {
        parent.XCG.delegate.gamblingMachineService.sendCommandToGame(command);
    };


    /**
     * Informs the game about the changes for the size of the game layer.
     * @deprecated should not be called by the game and will be removed in upcoming version
     * @param {object} size Size with width and height
     */
    gamblingMachineService.informGameOfResize = function (size) {
        parent.XCG.delegate.gamblingMachineService.informGameOfResize(size);
    };

    return gamblingMachineService;
};

ECG.impl.createGamblingMachineSpecification = function () {
    var gamblingMachineSpecification = {};

    /**
     * Returns locale for language specific things in game client
     *
     * @returns locale format is Java Locale format
     */
    gamblingMachineSpecification.getLocale = function () {
        return parent.XCG.delegate.gamblingMachineSpecification.getLocale();
    };

    /**
     * Returns true if translation for key exists. The translation is only available for the user chosen language.
     *
     * @param key   translation key
     * @returns translation-map
     * @deprecated shouldn't be used, because the games are supposed to bring their own translations
     */
    gamblingMachineSpecification.hasTranslation = function (key) {
        return parent.XCG.delegate.gamblingMachineSpecification.hasTranslation(key);
    };

    /**
     * Returns translation for key over labels to get translated values. The translation is only available
     * for the user chosen language.
     *
     * @param key   translation key
     * @returns translation text
     * @deprecated shouldn't be used, because the games are supposed to bring their own translations
     */
    gamblingMachineSpecification.getTranslation = function (key) {
        return parent.XCG.delegate.gamblingMachineSpecification.getTranslation(key);
    };

    /**
     * Returns display height and width usable for game.
     *
     * @returns object with height and width
     */
    gamblingMachineSpecification.getDisplaySize = function () {
        return parent.XCG.delegate.gamblingMachineSpecification.getDisplaySize();
    };

    /**
     * Returns currency data to display formatted money value
     *
     * @returns object {
     *      currency : string, e. g. "USD"
     *      currencySymbol : string, e. g. "$"
     *      printedBefore : boolean, e. g. true
     *      decimalPoint : string, e. g. "."
     *      thousandsSeparator : string, e. g. ","
     *  }
     */
    gamblingMachineSpecification.getCurrency = function () {
        return parent.XCG.delegate.gamblingMachineSpecification.getCurrency();
    };

    /**
     * @return returns the jurisdiction. E.g. "IoM" or "ES"
     */
    gamblingMachineSpecification.getJurisdiction = function () {
        return parent.XCG.delegate.gamblingMachineSpecification.getJurisdiction();
    };

    /**
     * Returns help text for current game.
     * @deprecated Since version 6.6. Will be deleted soon. Use getJurisdiction() and getLocale() information in order to provide help content yourself.
     * @returns     help text
     */
    gamblingMachineSpecification.getHelpContent = function () {
        return parent.XCG.delegate.gamblingMachineSpecification.getHelpContent();
    };

    gamblingMachineSpecification.setHelpContent = function (htmlString) {
        parent.XCG.delegate.gamblingMachineSpecification.setHelpContent(htmlString);
    };

    /**
     * @deprecated should not be called by the game and will be removed in upcoming version
     *
     * @returns {}
     */
    gamblingMachineSpecification.getSlotSessionInformation = function () {
        return {};
    };


    /**
     * Returns casino option value.
     *
     * @param key   for casino option
     * @returns     value of casino option
     */
    gamblingMachineSpecification.getCasinoOption = function (key) {
        return parent.XCG.delegate.gamblingMachineSpecification.getCasinoOption(key);
    };

    /**
     * Returns responsible gaming url.
     * @deprecated use function openResponsibleGamingUrl in gamblingMachineService
     * */
    gamblingMachineSpecification.openResponsibleGamingUrl = function () {
        parent.XCG.delegate.gamblingMachineService.openResponsibleGamingUrl();
    };

    /**
     * Returns if DomainOption "Responsible Gaming" is active
     *
     * @returns true if ResponsibleGaming is active, otherwise false
     */
    gamblingMachineSpecification.isResponsibleGamingActive = function () {
        return parent.XCG.delegate.gamblingMachineSpecification.isResponsibleGamingActive();
    };

    /**
     * Returns the customizable path to the Responsible Gaming Icon
     *
     * @returns String with Path To Icon for Responsible Gaming
     * */
    gamblingMachineSpecification.getResponsibleGamingIconPath = function () {
        return parent.XCG.delegate.gamblingMachineSpecification.getResponsibleGamingIconPath();
    };

    /**
     * Requests the logout of the current player from the portal
     * @deprecated use function logoutPortalUser in gamblingMachineService
     * @param reason
     */
    gamblingMachineSpecification.logoutPortalUser = function (reason) {
        parent.XCG.delegate.gamblingMachineService.logoutPortalUser(reason);
    };

    return gamblingMachineSpecification;
};

ECG.impl.createLayoutSpecification = function () {
    var layoutSpecification = {};

    layoutSpecification.depotBalanceVisible = function () {
        return parent.XCG.delegate.layoutSpecification.depotBalanceVisible();
    };
    layoutSpecification.stakeVisible = function () {
        return parent.XCG.delegate.layoutSpecification.stakeVisible();
    };
    layoutSpecification.winVisible = function () {
        return parent.XCG.delegate.layoutSpecification.winVisible();
    };
    layoutSpecification.coinSizesEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.coinSizesEnabled();
    };
    layoutSpecification.lineEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.lineEnabled();
    };
    layoutSpecification.maxBetEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.maxBetEnabled();
    };
    layoutSpecification.autoplayEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.autoplayEnabled();
    };
    layoutSpecification.spinEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.spinEnabled();
    };
    layoutSpecification.fullscreenEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.fullscreenEnabled();
    };
    layoutSpecification.soundEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.soundEnabled();
    };
    layoutSpecification.homeEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.homeEnabled();
    };
    layoutSpecification.paytableEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.paytableEnabled();
    };
    layoutSpecification.helpEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.helpEnabled();
    };
    layoutSpecification.fastSpinEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.fastSpinEnabled();
    };
    layoutSpecification.gambleEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.gambleEnabled();
    };
    layoutSpecification.riskLadderEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.riskLadderEnabled();
    };
    layoutSpecification.collectEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.collectEnabled();
    };
    layoutSpecification.responsibleGamingEnabled = function () {
        return parent.XCG.delegate.layoutSpecification.responsibleGamingEnabled();
    };

    return layoutSpecification;
};

ECG.api.gamblingMachineEnvironment = ECG.impl.createApiGamblingMachineEnvironment();

ECG.api.gamblingMachineService = ECG.impl.createApiGamblingMachineService();
ECG.api.gamblingMachineSpecification = ECG.impl.createGamblingMachineSpecification();

/**
 * the layout specification contained some configurations to define the layout of the client.
 * it included the configuration of domain options and player options to display buttons
 */
ECG.api.layoutSpecification = ECG.impl.createLayoutSpecification();

ECG.debug = ECG.debug || {};
ECG.debug = parent.XCG.debug;

/**
 * @module loadProgressDisplay
 */
var ECG = ECG || {};
ECG.impl = ECG.impl || {};
ECG.api = ECG.api || {};
ECG.api.loadProgressDisplay = function () {
    var animation;
    var intervalID;
    var progress = 0;
    var canvasJQ;
    var canvas;

    function startAnimation() {
        createPreloaderCanvas();
        var ctx = canvas.getContext('2d');

        animation = ECG.impl.preloaderGUI;
        animation.init(ctx);
        intervalID = setInterval(draw, 33);
    }

    function createPreloaderCanvas() {
        var width = $(window).width();
        var height = $(window).height();

        createCanvas(height, width);
        applyCSSStylesToCanvas();

        canvas = canvasJQ[0];
        $('body').append(canvasJQ);
    }

    function createCanvas(height, width) {
        // set width and height of the canvas element. we can not use css props, due to lacking support
        // in some browsers
        canvasJQ = $('<canvas id="progress_display_canvas" height="' + height + '" width="' + width + '"></canvas>',
            {'class': 'progress_display'});
    }

    function applyCSSStylesToCanvas() {
        canvasJQ.css("width", "100%").css("height", "100%")
            .css("position", "absolute").css("left", 0).css("top", 0)
            .css("z-index", 1000);

        createBackroundGradientStyle();
    }

    function createBackroundGradientStyle() {
        $("head").append("<style id='ecg_edict_preloader'></style>");

        // The gradioent values where created with the help of the tool on http://www.colorzilla.com/gradient-editor/
        $("#ecg_edict_preloader").text(
            "#progress_display_canvas {background: #262626; /* Old browsers */" +
            "background: -moz-linear-gradient(top,  #4a4c4d 0%, #262626 100%); /* FF3.6+ */" +
            "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#4a4c4d), color-stop(100%,#262626)); /* Chrome,Safari4+ */" +
            "background: -webkit-linear-gradient(top,  #4a4c4d 0%,#262626 100%); /* Chrome10+,Safari5.1+ */" +
            "background: -o-linear-gradient(top,  #4a4c4d 0%,#262626 100%);/* Opera 11.10+ */" +
            "background: -ms-linear-gradient(top,  #4a4c4d 0%,#262626 100%); /* IE10+ */" +
            "background: linear-gradient(to bottom,  #4a4c4d 0%,#262626 100%);/* W3C */" +
            "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#4a4c4d', endColorstr='#262626',GradientType=0 ); /* IE6-9 */}"
        );
    }


    function draw() {
        animation.setProgress(progress);
    }

    function stopAnimation() {
        clearInterval(intervalID);
        $(canvasJQ).hide();

    }

    return {

        /**
         * Displays a generic load progress display UI above the game client UI.
         * <p/>
         * The load progress display will cover the whole screen of the device and will be added to the DOM at
         * z-index 1000.
         */
        show: function () {
            parent.XCG.debug.log("show preloader...");
            parent.XCG.edict.portalInformation.gameLoadingStarted();
            startAnimation();
        },

        /**
         * removes the progress display UI from the DOM
         */
        hide: function () {
            parent.XCG.debug.log("hide preloader and inform portal environment...");
            parent.XCG.edict.portalInformation.gameLoadingEnded();
            //wait a little...just for fun.
            setTimeout(stopAnimation, 100);
        },

        /**
         * sets the load progress in percent
         *
         * @param value a Number between 0 and 100
         */
        setProgress: function (value) {
            if (typeof value === "number") {
                value = Math.max(0, value);
                var newProgress = Math.min(value, 100);
                if (newProgress > progress) {
                    progress = newProgress;
                }
                parent.XCG.debug.log("preloader progress = " + progress + "%");
                parent.XCG.edict.portalInformation.gameLoadingProgress(progress);
            } else {
                parent.XCG.debug.log("WARNING: set progress must be called with numerical values");
            }
        }

    };
}();
ECG.impl.preloaderGUI = function () {

    /*
     This implementation is based on the example code on
     http://www.splashnology.com/article/how-to-create-a-progress-bar-with-html5-canvas/478/
     */
    var context;
    var bar_total_width = 330;
    var bar_total_height = 28;
    var bar_x = 0;
    var bar_y = 0;
    var radius = bar_total_height / 2;

    function init(ctx) {
        var progress_lingrad;
        context = ctx;

        //define bar position
        bar_x = (ctx.canvas.width / 2) - (bar_total_width / 2);
        bar_y = ctx.canvas.height / 2 + 70;


        // Gradient of the progress
        progress_lingrad = context.createLinearGradient(0, bar_y + bar_total_height, 0, 0);
        progress_lingrad.addColorStop(0, '#65acbb');
        progress_lingrad.addColorStop(0.4, '#65acbb');
        progress_lingrad.addColorStop(1, '#65acbb');
        context.fillStyle = progress_lingrad;

        loadLogo();
    }

    function loadLogo() {
        var img = new Image();

        img.onload = function () {
        	var x = (context.canvas.width / 2) - (img.width / 2);
            var margin = 20;
            var y = bar_y - img.height - margin;
            //Avoid floats for draw coordinates
            context.drawImage(img, parseInt(x), parseInt(y), img.width, img.height);
        };

        loadImage(img);
    }

    function loadImage(img) {
        //this will cause the actual loading
        img.src = parent.XCG.edict.portalInformation.getGameRootUrl() + "/core/branding/language-independent/images/customer_logo.png";
    }

    function setProgress(progress) {
        drawProgressBar(progress);
    }

    function drawProgressBar(progress) {
        var width = progress * bar_total_width / 100;
        // Clear the layer
        context.clearRect(bar_x - 5, bar_y - 5, bar_total_width + 15, bar_total_height + 15);

        drawProgressBackgroundWithBorder(context, bar_x, bar_y, bar_total_width, bar_total_height, radius);
        drawProgressIndicator(context, bar_x, bar_y, width, bar_total_height, radius, bar_total_width);
    }

    function setContextFillStyle(ctx, x, y, height) {
        var lingrad = ctx.createLinearGradient(x, y, x, y+height);
        lingrad.addColorStop(0, '#262626');
        lingrad.addColorStop(1, '#4a4c4d');
        ctx.fillStyle = lingrad;
    }

    function drawProgressBackgroundWithShadow(ctx, x, y, width, height, radius) {
            ctx.save();
            // Define the shadows
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#666';

            // first grey layer
            ctx.fillStyle = 'rgba(189,189,189,1)';
            roundRect(ctx, x, y, width, height, radius);

            // second layer with gradient
            // remove the shadow
            ctx.shadowColor = 'rgba(0,0,0,0)';
            setContextFillStyle(ctx, x, y, height);
            roundRect(ctx, x, y, width, height, radius);
            ctx.restore();
        }

    function drawProgressBackgroundWithBorder(ctx, x, y, width, height, radius) {
        var bordersize = 0;

        ctx.save();
        // Define the shadows
        // first grey layer
        ctx.fillStyle = 'rgba(0,0,0,1)';
        roundRect(ctx, x - bordersize, y - bordersize, width + (2 * bordersize), height + (2 * bordersize), radius + bordersize);

        // second layer with gradient
        // remove the shadow
        ctx.shadowColor = 'rgba(0,0,0,0)';
        setContextFillStyle(ctx, x, y, height);
        roundRect(ctx, x, y, width, height, radius);
        ctx.restore();
    }


    function drawProgressIndicator(ctx, x, y, width, height, radius, max) {
        // deplacement for chord drawing
        var offset = 0;
        var left_angle;
        var right_angle;
        ctx.beginPath();
        if (width < radius) {
            offset = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow((radius - width), 2));
            // Left angle
            left_angle = Math.acos((radius - width) / radius);
            ctx.moveTo(x + width, y + offset);
            ctx.lineTo(x + width, y + height - offset);
            ctx.arc(x + radius, y + radius, radius, Math.PI - left_angle, Math.PI + left_angle, false);
        }
        else if (width + radius > max) {
            offset = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow((radius - (max - width)), 2));
            // Right angle
            right_angle = Math.acos((radius - (max - width)) / radius);
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width, y);
            ctx.arc(x + max - radius, y + radius, radius, -Math.PI / 2, -right_angle, false);
            ctx.lineTo(x + width, y + height - offset);
            ctx.arc(x + max - radius, y + radius, radius, right_angle, Math.PI / 2, false);
            ctx.lineTo(x + radius, y + height);
            ctx.arc(x + radius, y + radius, radius, Math.PI / 2, 3 * Math.PI / 2, false);
        }
        else {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.arc(x + radius, y + radius, radius, Math.PI / 2, 3 * Math.PI / 2, false);
        }
        ctx.closePath();
        ctx.fill();

        // shadow on the right
        if (width < max - 1) {
            ctx.save();
            ctx.shadowOffsetX = 1;
            ctx.shadowBlur = 1;
            ctx.shadowColor = '#666';
            if (width + radius > max) {
                offset = offset + 1;
            }
            ctx.fillRect(x + width, y + offset, 1, bar_total_height - offset * 2);
            ctx.restore();
        }
    }

    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(x + radius, y + height);
        ctx.arc(x + radius, y + radius, radius, Math.PI / 2, 3 * Math.PI / 2, false);
        ctx.closePath();
        ctx.fill();
    }


    return {
        init: init,
        setProgress: setProgress
    };
}();
