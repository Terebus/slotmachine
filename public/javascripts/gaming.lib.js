/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright © edict egaming GmbH, Hamburg (Germany) [2014]
 */

 /* -------------------------------------------------------- */
 /*                                                          */
 /*         Gaming.lib                                       */
 /*         Version: 5.3.3                      */
 /*         BuildVersion:  7ab1c0d2f367ac262a0e55852a8cde9e0462bdba                    */
 /*                                                          */
 /* -------------------------------------------------------- */
/*************************************************************
 * xcg.info
 *************************************************************/
"use strict";

var XCG = {};
XCG.info = {};
XCG.edict7 = {};
XCG.delegate7 = {};
XCG.edict7_1 = {};
XCG.delegate7_1 = {};
XCG.debug = {};

//set defaults for clients <= 7.0
XCG.edict = {};
XCG.edict.slotSession = {};

// never change this line. it's changed by the release process!!!
XCG.debug.logEnabled = true;

var console = console || (console = {
    log: function () {
    },
    debug: function () {
    },
    warn: function () {
    }
});

XCG.debug.log = function (logMessage) {
    if (XCG.debug.logEnabled) {
        console.log('core-js:   ' + logMessage);
    }
};

XCG.info.createInformationEnvironment = function () {

    var generateDelegate7 = function () {
        if (XCG.delegate === undefined) {
            XCG.delegate = XCG.delegate7;
            XCG.edict = XCG.edict7;
        }
    };

    var generateDelegate7_1 = function () {
        if (XCG.delegate === undefined) {
            XCG.delegate = XCG.delegate7_1;
            XCG.edict = XCG.edict7_1;
        }
    };

    /**
     * @class
     */
    var info = {};

    info.generateDelegate = function (version) {
        if (version === '7.0') {
            generateDelegate7();
            return;
        } else if (version === '7.1') {
            generateDelegate7_1();
            return;
        }
        console.log("Version $version of GamblingMachineAPI is not supported on current server!");
        alert("Version $version of GamblingMachineAPI is not supported on current server!");
    };

    return info;
};

XCG.info = XCG.info.createInformationEnvironment();

var GLOBAL_XCG = Object.create(XCG);

/*************************************************************
 * xcg.delegate7.gamblingMachineEnvironment
 *************************************************************/

XCG.edict7.createDelegateGamblingMachineEnvironment = function () {

    var startGameCallback;
    var commandDelegateFromGame;

    var commandCallbackProxy = function (actionCommand) {
        if (actionCommand === XCG.edict7.actionCommands.UPDATEDEPOT) {
            XCG.delegate7.gamblingMachineService.updateBalance();
        }
        commandDelegateFromGame(actionCommand);
    };

    /**
     * @class
     */
    var gamblingMachineEnvironment = {};

    /**
     * Calls startCallback when system is prepared.
     * <p/>
     * The startCallback is executed after the gambling machine environment.resumeStartUp is called async.
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
     * <body onload="XCG.api.gamblingMachineEnvironment.onPrepared(YOUR_GAME.start, YOUR_GAME.command)">
     *
     * @param startCallback  contains the start-game-logic
     * @param commandCallback contains the game-logic to handle external game commands (e.g 'pause', 'resume')
     * @param resizeCallback contains the functionality to resize the gameclient (parameters: x and y in pixels)
     */
    gamblingMachineEnvironment.onPrepared = function (startCallback, commandCallback, resizeCallback) {
        startGameCallback = startCallback;
        commandDelegateFromGame = commandCallback;
        XCG.delegate7.gamblingMachineService.setCommandCallback(commandCallbackProxy);
        XCG.delegate7.gamblingMachineService.setSizeChangedCallback(resizeCallback);
    };

    /*
     * Will be called XCG.edict7.windowMessageHandler once the portal has send the portalInformation.
     * The startCallback of the game will be called to inform the game about the finished initialization.
     * @param portalInfo The portalInformation object send by the portal.
     */
    gamblingMachineEnvironment.resumeStartUp = function (portalInfo) {
        XCG.debug.log('Start gameclient...');
        XCG.edict7.portalInformation = portalInfo;
        initHelpContent();
        initGameCallbacks();
        startGameCallback();
    };

    function initHelpContent() {
        var helpContentObject = XCG.edict7.portalInformation.getHelpContent();
        if (helpContentObject instanceof jQuery) {
            helpContentObject = helpContentObject.wrapAll('<div>').parent().html();
        }
        XCG.delegate7.gamblingMachineSpecification.setHelpContent(helpContentObject);
    }

    function initGameCallbacks() {
        //Give the portal the core proxy functions to use the same code for both types of communication
        XCG.edict7.portalInformation.setCommandCallback(XCG.delegate7.gamblingMachineService.sendCommandToGame);
        XCG.edict7.portalInformation.setSizeChangedCallback(function (x, y) {
            XCG.delegate7.gamblingMachineService.informGameOfResize({width: x, height: y});
        });
    }

    return gamblingMachineEnvironment;
};

XCG.delegate7.gamblingMachineEnvironment = XCG.edict7.createDelegateGamblingMachineEnvironment();

/*************************************************************
 * xcg.delegate7.gamblingMachineService
 *************************************************************/

XCG.edict7.createDelegateGamblingMachineService = function () {

    /**
     * @class Gambling Machine Service
     */
    var gamblingMachineService = {};
    var currentGameSessionUuid = '';
    var depotBalance = 0;
    var limitedDepotBalance = 0;
    //Init minimalStake with -1 to detect unsupported game spec information
    var minimalStake = -1;
    //Game callbacks
    var gameClientSizeChangedCallback;
    var actionCommandCallback;

    XCG.edict7.slotSession = {};

    var setDepotBalances = function (depotDTO) {
        limitedDepotBalance = depotDTO.limitBalance;
        depotBalance = depotDTO.balance;
    };

    var doBalanceCheck = function () {
        if (minimalStake !== -1) {
            if (limitedDepotBalance < minimalStake) {
                XCG.debug.log('Balance is now lower than the minimal stake of  ' + minimalStake);
                XCG.edict7.portalInformation.balanceTooLow();
            }
        } else {
            XCG.debug.log('Game or portal does not support balanceTooLow operation');
        }
    };

    var handleSlotSession = function (dtoObject) {
        if (!XCG.edict7.isEmpty(dtoObject.slotSession)) {
            XCG.edict7.slotSession = dtoObject.slotSession;
        } else {
            XCG.debug.log('Response contains no slotSession information.');
            XCG.edict7.slotSession = {};
        }
        gameFrame.htmlGameCommunicator.slotSessionTimerRunning = false;
        gameFrame.htmlGameCommunicator.updateSlotSessionGUI();
    };

    var handleCasinoFreespin = function (casinoFreespinData) {
        gameStart.CasinoFreespinsLayer.updateGUI(casinoFreespinData);
    };

    var handleBusinessException = function (responseDTO) {
        var propName;
        var prop;
        if (responseContainsBusinessException(responseDTO)) {
            for (propName in responseDTO) {
                prop = responseDTO[propName];
                XCG.edict7.errors.handleError(prop.error);
                break;
            }
        }
    };

    var responseContainsBusinessException = function (responseDTO) {
        var propName;
        var prop;
        var hasException = false;
        for (propName in responseDTO) {
            prop = responseDTO[propName];
            if (typeof prop.error !== 'undefined') {
                hasException = true;
                break;
            }
        }
        return hasException;
    };

    var proofDTO = function (dtoObject, validatorFunction) {
        var isValid = validatorFunction(dtoObject);
        if (!isValid) {
            XCG.edict7.errors.handleError(XCG.edict7.errors.generateDeSerializationErrorDTO());
        }
        return isValid;
    };

    gamblingMachineService.updateBalance = function () {
        var response = XCG.edict7.connector.sendCoreRequest(XCG.edict7.requestTypes.balanceRequest());
        if (response) {
            var depotDTO = response[XCG.edict7.DTO_NAME_DEPOT];
            setDepotBalances(depotDTO);
        }
    };

    /**
     * Starts the javascript-core-engine.
     * <p/>
     * The GamblingMachine backend will be initialized and started.
     *
     * @return game data from GamblingMachine backend for initialization for the game client
     */
    gamblingMachineService.start = function () {
        XCG.debug.log('Start JS gambling machine...');
        //Reset currentGameSessionUuid
        currentGameSessionUuid = '';
        var response;
        var dtoObject;
        var connector = XCG.edict7.connector;
        var isValidJoinSessionDTO;
        connector.setGamingCookies(XCG.edict7.portalInformation.requiredCookies);
        connector.sendCoreRequest(XCG.edict7.requestTypes.initRequest());
        response = connector.sendCoreRequest(XCG.edict7.requestTypes.startRequest());
        if (response) {
            if (responseContainsBusinessException(response)) {
                handleBusinessException(response);
            } else {
                isValidJoinSessionDTO = proofDTO(response, XCG.edict7.validator.isValidJoinSessionDTO);
                if (isValidJoinSessionDTO) {
                    dtoObject = response[XCG.edict7.DTO_NAME_JOIN_SESSION];
                    currentGameSessionUuid = dtoObject.gameSessionUuid;
                    setDepotBalances(dtoObject.depot);
                    if ('gameSpecs' in dtoObject) {
                        minimalStake = dtoObject.gameSpecs.minimalStake;
                    }
                    XCG.edict7.messaging.handleMessages(dtoObject, function () {
                    });

                    gameStart.heartbeatTimer.start();
                    handleSlotSession(dtoObject);
                    return (typeof dtoObject.gameData !== 'undefined') ? dtoObject.gameData : null;
                }
            }
        }
        return null;
    };


    gamblingMachineService.stop = function () {
        var connector = XCG.edict7.connector;
        gameStart.heartbeatTimer.stop();
        connector.sendCoreRequest(XCG.edict7.requestTypes.closeRequest(currentGameSessionUuid));
        XCG.edict7.portalInformation.closeGameClient();
    };

    gamblingMachineService.send = function (gameData, callback, synchron) {
        var connector = XCG.edict7.connector;
        var onRequestCallback = function (responseData) {

            if (responseData) {
                if (responseContainsBusinessException(responseData)) {
                    handleBusinessException(responseData);
                } else {
                    var gameClientActionResponseDTO = responseData[XCG.edict7.DTO_NAME_GAME_CLIENT_ACTION];
                    if (gameClientActionResponseDTO) {
                        var isValidGameClientActionDTO = proofDTO(responseData, XCG.edict7.validator.isValidGameClientActionDTO);
                        if (isValidGameClientActionDTO) {
                            connector.blockGameRequests();
                            XCG.edict7.messaging.handleMessages(gameClientActionResponseDTO, function () {
                                connector.unblockGameRequests();
                                setDepotBalances(gameClientActionResponseDTO.coreData.depot);
                                doBalanceCheck();
                                handleSlotSession(gameClientActionResponseDTO);
                                handleCasinoFreespin(gameClientActionResponseDTO.freespinInfo);
                                callback(gameClientActionResponseDTO.gameData);
                            });
                        }
                    }
                }
            }
        };
        connector.sendGameRequest(XCG.edict7.requestTypes.onCommandRequest(gameData), onRequestCallback, synchron);
    };


    /**
     * Returns the full depot balance.
     * @returns {number}
     */
    gamblingMachineService.getDepotBalance = function () {
        return depotBalance;
    };

    /**
     * Returns the limited depot balance.
     * needs to be shown by the gameclient seperately when value differs from
     * the value which getDepotBalance returns
     * @returns {number}
     */
    gamblingMachineService.getLimitedDepotBalance = function () {
        return limitedDepotBalance;
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
        XCG.edict7.messaging.showSuppressedCasinoMessages(resumeCallback);
    };

    /**
     * Request minimization of the Client. This is only possible, if client is maximized.
     * After size change is completed, the resizeCallback will be called.
     */
    gamblingMachineService.minimizeClient = function () {
        XCG.edict7.portalInformation.minimizeClient();
    };

    /**
     * Request maximization of the Client. This is only possible, if client is minimized.
     * After size change is completed, the resizeCallback will be called.
     */
    gamblingMachineService.maximizeClient = function () {
        XCG.edict7.portalInformation.maximizeClient();
    };

    /**
     * Must be called when the animation of a new game round has been started
     * to inform the portal environment about that.
     */
    gamblingMachineService.gameRoundStarted = function () {
        XCG.debug.log('gameRoundStarted event received');
        XCG.edict7.portalInformation.gameRoundStarted();
    };

    /**
     * Must be called when the animation of a game round has been ended
     * to inform the portal environment about that.
     */
    gamblingMachineService.gameRoundEnded = function () {
        XCG.debug.log('gameRoundEnded event received');
        XCG.edict7.portalInformation.gameRoundEnded();
    };

    /**
     * Requests the logout of the current player from the portal
     * @param reason Optional reason for log out.
     */
    gamblingMachineService.logoutPortalUser = function (reason) {
        XCG.edict7.portalInformation.logoutPortalUser();
    };

    /**
     * Requests to present the ResponsibleGamingUrl from the portal
     * */
    gamblingMachineService.openResponsibleGamingUrl = function () {
        XCG.edict7.portalInformation.openResponsibleGamingUrl();
    };

    /**
     * Show abortion message and close game client.
     * </p>
     * This function should be called if
     * - resources could not be loaded
     * - unexpected errors occurred
     */
    gamblingMachineService.abortGame = function () {
        XCG.edict7.connector.sendCoreRequest(XCG.edict7.requestTypes.closeRequest(currentGameSessionUuid));
        XCG.edict7.errors.handleError(XCG.edict7.errors.generateLoadErrorDTO());
    };

    /**
     * set for gameClientSizeChangedCallback
     * @param sizeChangedCallback Callback given by game during onPrepared
     */
    gamblingMachineService.setSizeChangedCallback = function (sizeChangedCallback) {
        gameClientSizeChangedCallback = sizeChangedCallback;
    };

    /**
     * set for CommandCallback
     * @param commandCallback Callback given by game during onPrepared
     */
    gamblingMachineService.setCommandCallback = function (commandCallback) {
        actionCommandCallback = commandCallback;
    };

    /**
     * Sends the given command to the game via the actionCommandCallback.
     *
     * @param {string} command Command name to send
     */
    gamblingMachineService.sendCommandToGame = function (command) {
        actionCommandCallback(command);
    };


    /**
     * Informs the game about the changes for the size of the game layer.
     * @param {object} size Size with width and height
     */
    gamblingMachineService.informGameOfResize = function (size) {
        gameClientSizeChangedCallback(size.width, size.height);
    };

    return gamblingMachineService;
};

/**
 * Gambling Machine Service used to start a game.
 */
XCG.delegate7.gamblingMachineService = XCG.edict7.createDelegateGamblingMachineService();

/*************************************************************
 * xcg.delegate7.gamblingMachineSpecification
 *************************************************************/

XCG.edict7.createDelegateGamblingMachineSpecification = function () {

    var helpContent;

    /**
     * @class
     */
    var gamblingMachineSpecification = {};

    /**
     * Returns locale for language specific things in game client
     *
     * @returns locale format is Java Locale format
     */
    gamblingMachineSpecification.getLocale = function () {
        return XCG.edict7.portalInformation.getLocale();
    };

    /**
     * Returns true if translation for key exists. The translation is only available for the user chosen language.
     *
     * @param key   translation key
     * @returns translation-map
     * @deprecated shouldn't be used, because the games are supposed to bring their own translations
     */
    gamblingMachineSpecification.hasTranslation = function (key) {
        return XCG.edict7.portalInformation.getTranslations().hasOwnProperty(key);
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
        if (this.hasTranslation(key)) {
            return XCG.edict7.portalInformation.getTranslations()[key];
        }
        return key;
    };

    /**
     * Returns display height and width usable for game.
     *
     * @returns object with height and width
     */
    gamblingMachineSpecification.getDisplaySize = function () {
        var gameSize =  XCG.edict7.portalInformation.getGameSize();
        //console.debug("get Display size called Width: "+gameSize.width+",Height: "+gameSize.height);
        return {
            height: gameSize.height,
            width: gameSize.width
        };
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
        return XCG.edict7.portalInformation.getCurrency();
    };

    /**
     * @return returns the jurisdiction. E.g. "IoM" or "ES"
     */
    gamblingMachineSpecification.getJurisdiction = function () {
        return XCG.edict7.portalInformation.getJurisdiction();
    };

    /**
     * Returns help text for current game.
     * @deprecated Since version 6.6. Will be deleted soon. Use getJurisdiction() and getLocale() information in order to provide help content yourself.
     * @returns     help text
     */
    gamblingMachineSpecification.getHelpContent = function () {
        XCG.edict7.logWarning('Deprecated call to gamblingMachineSpecification.getHelpContent(), please call gamblingMachineSpecification.getJurisdiction() and gamblingMachineSpecification.getLocale() and use this information in order to provide help content yourself.');
        return helpContent;
    };

    gamblingMachineSpecification.setHelpContent = function (htmlString) {
        var $fragment = $(htmlString);
        helpContent = $fragment;
    };


    /**
     * Returns casino option value.
     *
     * @param key   for casino option
     * @returns     value of casino option
     */
    gamblingMachineSpecification.getCasinoOption = function (key) {
        return XCG.edict7.portalInformation.getDomainOption(key);
    };

    /**
     * Returns responsible gaming url.
     * @deprecated use function openResponsibleGamingUrl in gamblingMachineService
     * */
    gamblingMachineSpecification.openResponsibleGamingUrl = function () {
        XCG.edict7.logWarning('Deprecated call to gamblingMachineSpecification.openResponsibleGamingUrl, please call XCG.delegate7.gamblingMachineService.openResponsibleGamingUrl instead!');
        XCG.delegate7.gamblingMachineService.openResponsibleGamingUrl();
    };

    /**
     * Returns if DomainOption "Responsible Gaming" is active
     *
     * @returns true if ResponsibleGaming is active, otherwise false
     */
    gamblingMachineSpecification.isResponsibleGamingActive = function () {
        return XCG.edict7.portalInformation.isResponsibleGamingActive();
    };

    /**
     * Returns the customizable path to the Responsible Gaming Icon
     *
     * @returns String with Path To Icon for Responsible Gaming
     * */
    gamblingMachineSpecification.getResponsibleGamingIconPath = function () {
        return XCG.edict7.portalInformation.getResponsibleGamingIconPath();
    };

    /**
     * Requests the logout of the current player from the portal
     * @deprecated use function logoutPortalUser in gamblingMachineService
     * @param reason
     */
    gamblingMachineSpecification.logoutPortalUser = function (reason) {
        XCG.edict7.logWarning('Deprecated call to gamblingMachineSpecification.logoutPortalUser, please call XCG.delegate7.gamblingMachineService.logoutPortalUser instead!');
        XCG.delegate7.gamblingMachineService.logoutPortalUser(reason);
    };

    return gamblingMachineSpecification;
};

XCG.delegate7.gamblingMachineSpecification = XCG.edict7.createDelegateGamblingMachineSpecification();

/*************************************************************
 * XCG.delegate7.layoutSpecification
 *************************************************************/

XCG.edict7.createLayoutSpecification = function () {
    /**
     * @class layout specification
     */
    var layoutSpecification = {};

    layoutSpecification.depotBalanceVisible = function () {
        return XCG.edict7.portalInformation.layout.depotBalanceVisible;
    };
    layoutSpecification.stakeVisible = function () {
        return XCG.edict7.portalInformation.layout.stakeVisible;
    };
    layoutSpecification.winVisible = function () {
        return XCG.edict7.portalInformation.layout.winVisible;
    };
    layoutSpecification.coinSizesEnabled = function () {
        return XCG.edict7.portalInformation.layout.coinSizesEnabled;
    };
    layoutSpecification.lineEnabled = function () {
        return XCG.edict7.portalInformation.layout.lineEnabled;
    };
    layoutSpecification.maxBetEnabled = function () {
        return XCG.edict7.portalInformation.layout.maxBetEnabled;
    };
    layoutSpecification.autoplayEnabled = function () {
        return XCG.edict7.portalInformation.layout.autoplayEnabled;
    };
    layoutSpecification.spinEnabled = function () {
        return XCG.edict7.portalInformation.layout.spinEnabled;
    };
    layoutSpecification.fullscreenEnabled = function () {
        return XCG.edict7.portalInformation.layout.fullscreenEnabled;
    };
    layoutSpecification.soundEnabled = function () {
        return XCG.edict7.portalInformation.layout.soundEnabled;
    };
    layoutSpecification.homeEnabled = function () {
        return XCG.edict7.portalInformation.layout.homeEnabled;
    };
    layoutSpecification.paytableEnabled = function () {
        return XCG.edict7.portalInformation.layout.paytableEnabled;
    };
    layoutSpecification.helpEnabled = function () {
        return XCG.edict7.portalInformation.layout.helpEnabled;
    };
    layoutSpecification.fastSpinEnabled = function () {
        return XCG.edict7.portalInformation.layout.fastSpinEnabled;
    };
    layoutSpecification.gambleEnabled = function () {
        return XCG.edict7.portalInformation.layout.gambleEnabled;
    };
    layoutSpecification.riskLadderEnabled = function () {
        return XCG.edict7.portalInformation.layout.riskLadderEnabled;
    };
    layoutSpecification.collectEnabled = function () {
        return XCG.edict7.portalInformation.layout.collectEnabled;
    };
    layoutSpecification.responsibleGamingEnabled = function () {
        return XCG.edict7.portalInformation.layout.responsibleGamingEnabled;
    };
    return layoutSpecification;
};

/**
 * the layout specification contained some configurations to define the layout of the client.
 * it included the configuration of domain options and player options to display buttons
 */
XCG.delegate7.layoutSpecification = XCG.edict7.createLayoutSpecification();

/*************************************************************
 * xcg.edict7.dtos
 *************************************************************/
XCG.edict7.dtos = function () {

    var coreVersion = "2.4.js-SNAPSHOT";

    var gameInfo = function () {
        return {
            gameVersion: 0,
            gameManufacturer: 'unused',
            gameType: 'unused'
        };
    };

    return {

        joinSessionRequestDTO: function () {
            //TODO gameTemplateName and game info are not used by API 2.0 games. Check if the backend accepts the request even if these values are not present
            return {
                "de.edict.eoc.gaming.comm.JoinSessionRequestDTO": {
                    command: 'start',
                    coreVersion: coreVersion,
                    gameInfo: gameInfo(),
                    gameTemplateName: ''
                }
            };
        },

        gameSessionRequestDTO: function (gameData, uuid, command) {
            return {
                "de.edict.eoc.gaming.comm.GameSessionRequestDTO": {
                    command: command,
                    gameData: gameData,
                    gameSessionUuid: uuid
                }
            };
        },

        requestDTO: function (commandName) {
            return {
                "de.edict.eoc.gaming.comm.RequestDTO": {
                    command: commandName
                }
            };
        }

    };

};

/*************************************************************
 * xcg.edict7.errors
 *************************************************************/
XCG.edict7.errors = {};

XCG.edict7.errors.generateServerErrorDTO = function (response) {
    var errorMessage = XCG.edict7.errors.type.ERROR_RPC_IO;
    if ( response.responseJSON){
        errorMessage = response.responseJSON.errorResponseDTO.returnMsg;
    }
    return {
        type: XCG.edict7.errors.type.ERROR_RPC_IO,
        priority: XCG.edict7.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: errorMessage,
        messageId: -1
    };
};

XCG.edict7.errors.generateCommunicationErrorDTO = function (response) {
    var errorMessage = XCG.edict7.errors.type.ERROR_RPC_HTTP;
    if ( response.responseJSON){
           errorMessage = response.responseJSON.errorResponseDTO.returnMsg;
       }
    return {
        type: XCG.edict7.errors.type.ERROR_RPC_HTTP,
        priority: XCG.edict7.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: errorMessage,
        messageId: -1,
        createdByFramework: true
    };
};

XCG.edict7.errors.generateConnectionLostErrorDTO = function (response) {
    var errorMessage = XCG.edict7.errors.type.ERROR_CONNECTION_FAILED;
    if ( response.responseJSON){
        errorMessage = response.responseJSON.errorResponseDTO.returnMsg;
    }
    return {
        type: XCG.edict7.errors.type.ERROR_CONNECTION_FAILED,
        priority: XCG.edict7.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7.errors.gameClientAction.RESTART,
        title: "ERROR",
        text: errorMessage,
        messageId: -1,
        params: [{ key: 'UI_ELEMENT', stringVal: 'BUTTON_RELOAD' }]
    };
};

XCG.edict7.errors.generateDeSerializationErrorDTO = function () {
    return {
        type: XCG.edict7.errors.type.ERROR_RPC_DESERIALIZATION,
        priority: XCG.edict7.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: XCG.edict7.errors.type.ERROR_RPC_DESERIALIZATION,
        messageId: -1
    };
};

XCG.edict7.errors.generateLoadErrorDTO = function () {
    return {
        type: XCG.edict7.errors.type.ERROR_LOAD,
        priority: XCG.edict7.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: XCG.edict7.errors.type.ERROR_LOAD,
        messageId: -1
    };
};

XCG.edict7.errors.priority = {
    HIGHEST: "HIGHEST"
};

XCG.edict7.errors.gameClientAction = {
    CLOSE: "CLOSE",
    RESTART: "RESTART"
};

XCG.edict7.errors.type = {
    ERROR_RPC_IO: "ERROR_RPC_IO",
    ERROR_RPC_HTTP: "ERROR_RPC_HTTP",
    ERROR_RPC_DESERIALIZATION: "ERROR_RPC_DESERIALIZATION",
    ERROR_LOAD: "ERROR_LOAD",
    ERROR_CONNECTION_FAILED: "ERROR_CONNECTION_FAILED"
};


XCG.edict7.errors.handleError = function (messageDTO) {
    var closeGameClientCallback = null;
    closeGameClientCallback = function () {
        XCG.edict7.portalInformation.closeGameClient();
    };
     var messageArray = [];
    messageArray.push(messageDTO);
    XCG.edict7.messaging.sendMessages(messageArray,closeGameClientCallback);
};

/*************************************************************
 * xcg.edict
 *************************************************************/

XCG.edict7.CONTENT_TYPE = "Content-Type";

XCG.edict7.APPLICATION_JSON = "application/json";

XCG.edict7.RESPONSE_OK_LOWER_BOUNDARY = 200;
XCG.edict7.RESPONSE_OK_UPPER_BOUNDARY = 226;
XCG.edict7.RESPONSE_CONNECTION_ERROR_LOWER_BOUNDARY = 400;
XCG.edict7.RESPONSE_CONNECTION_ERROR_UPPER_BOUNDARY = 499;
XCG.edict7.RESPONSE_SERVER_ERROR_LOWER_BOUNDARY = 500;
XCG.edict7.RESPONSE_SERVER_ERROR_UPPER_BOUNDARY = 599;

XCG.edict7.RESPONSE_REQUEST_TIMEOUT = 408;
XCG.edict7.RESPONSE_CLIENT_ERROR = 0;

XCG.edict7.DTO_NAME_JOIN_SESSION = "de.edict.eoc.gaming.comm.JoinSessionResponseDTO";
XCG.edict7.DTO_NAME_GAME_CLIENT_ACTION = "de.edict.eoc.gaming.comm.GameClientActionResponseDTO";
XCG.edict7.DTO_NAME_RESPONSE = "de.edict.eoc.gaming.comm.ResponseDTO";
XCG.edict7.DTO_NAME_HAERTBEAT_RESPONSE = "de.edict.eoc.gaming.comm.HeartbeatResponseDTO";
XCG.edict7.DTO_NAME_DEPOT = "de.edict.eoc.gaming.comm.DepotDTO";
XCG.edict7.actionCommands = {
            PAUSE: 'pause',
            RESUME: 'resume',
            UPDATEDEPOT: 'updateDepot',
            ENABLEAUDIO: 'enableAudio',
            DISABLEAUDIO: 'disableAudio'
        };
XCG.edict7.portalRequests = {
            PORTALINFORMATION: 'requestPortalInformation',
            HELP_CONTENT: 'requestHelpContent',
            BALANCE_TO_LOW: 'balanceTooLow',
            CLOSE_GAME_CLIENT: 'closeGameClient',
            MINIMIZE_CLIENT: 'minimizeClient',
            MAXMIZE_CLIENT: 'maximizeClient',
            GAME_ROUND_STARTED: 'gameRoundStarted',
            GAME_ROUND_ENDED: 'gameRoundEnded',
            GAME_LOADING_STARTED: 'gameLoadingStarted',
            GAME_LOADING_ENDED: 'gameLoadingEnded',
            LOGOUT_USER: 'logoutUser',
            OPEN_RESP_GAMING_URL: 'openResponsibleGamingUrl',
            SEND_MESSAGES: 'showMessages'
        };
XCG.edict7.portalInformation = null;

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

XCG.edict7.logWarning = function (logMessage) {
    if (console){
        console.warn(logMessage);
    }
};

XCG.edict7.isEmpty = function (obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

/*************************************************************
 * xcg.edict7.messaging
 *************************************************************/
XCG.edict7.createMessaging = function () {
    var messaging = {};
    var suppressedMessages = [];
    var resumeCallback;

    messaging.handleMessages = function (dtoObject, resumeCallbackFromGame) {
        resumeCallback = resumeCallbackFromGame;
        var messages = getMessagesFromResponseDTO(dtoObject);
        if (messages.length > 0) {
            handleMessages(messages);
        }
        resumeCallback();
    };

    messaging.handleMessages4HeartBeat = function (dtoObject) {
        var messages = getMessagesFromResponseDTO(dtoObject);
        if (messages.length > 0) {
            handleMessages(messages);
        }
    };

    function getMessagesFromResponseDTO(responseDTO) {
        var messagesArray;

        //check if we have a core object, if so get the messages list from there, otherwiese get messages directly from dto
        if (typeof responseDTO.coreData === 'object') {
            messagesArray = responseDTO.coreData.messages;
        } else {
            messagesArray = responseDTO.messages;
        }

        //make sure that we always return an array even if the dto does not cointain any messages
        if (typeof messagesArray !== 'undefined') {
            //fix for marshalling bug. array is a single object if only one message is present
            if (typeof messagesArray.length === 'undefined') {
                messagesArray = [messagesArray];
            }
        } else {
            messagesArray = [];
        }

        return messagesArray;
    }

    var handleMessages = function (messages) {
        var suppressedMessages = messages.filter(function (messageDTO) {
            return (messageDTO.priority === 'HIGHEST' || messageDTO.priority === 'ULTRA');
        });
        var filteredMessages = messages.filter(function (messageDTO) {
            return (messageDTO.priority !== 'HIGHEST' && messageDTO.priority !== 'ULTRA');
        });
        handleSuppressedMessages(suppressedMessages);
        if (filteredMessages.length > 0) {
            // messaging.sendMessages(filteredMessages);
            for (var i = 0; i < filteredMessages.length; i++) {
                gameFrame.displayGrowlMessageByTheWay(filteredMessages[i]);
            }
        }
    };

    function handleSuppressedMessages(messages) {
        for (var i = 0; i < messages.length; i++) {
            var messageAlreadyInQueue = false;
            var message = messages[i];
            for (var j = 0; j < suppressedMessages.length; j++) {
                if (suppressedMessages[j].messageId === message.messageId) {
                    messageAlreadyInQueue = true;
                    break;
                }
            }
            if (!messageAlreadyInQueue) {
                suppressedMessages.push(message);
            }
        }
    }

    /**
     * Sends the messages to the portal for displaying.
     * @param {array} messages  List of messages
     * @param {type} alternativeResumeCallback Optional callback to overwrite current.
     */
    messaging.sendMessages = function (messages, alternativeResumeCallback) {
        if (typeof alternativeResumeCallback === 'function') {
            XCG.debug.log('Use alternative resume callback');
            resumeCallback = alternativeResumeCallback;
        }
        var dummyCallback = function () {
        };
        XCG.edict7.portalInformation.showMessages(messages, dummyCallback, resumeCallback);
    };

    messaging.resumeGamePlay = function () {
        XCG.debug.log('Inform game about resuming game play.');
        resumeCallback();
    };

    messaging.showSuppressedCasinoMessages = function (resumeCallback) {
        if (suppressedMessages.length > 0) {
            messaging.sendMessages(suppressedMessages, resumeCallback);
            suppressedMessages = [];
        } else {
            //Nothing to do so resume instantly.
            resumeCallback();
        }
    };

    return messaging;
};

XCG.edict7.messaging = XCG.edict7.createMessaging();

/*************************************************************
 * xcg.edict7.requestTypes
 *************************************************************/
XCG.edict7.createRequestTypes = function () {

    var requestTypes = {};

    /**
     * Interface used as a prototype of all concrete Request-Types.
     * One Request-Type implements one specific REST-Call.
     * urlPath contains the path, to where the REST-Call should be send.
     * dtoObject contains the body that should be included in the REST-Call.
     * retryPolicy contains the number of retries for the request-type.
     * @type {{urlPath: string, dtoObject: string, retryPolicy: number}}
     */
    var requestInterface = {
        urlPath: "",
        dtoObject: "",
        retryPolicy: 0,
        method: "POST"
    };

    /**
     * Constructs an object with prototype.
     * @return {F}
     */
    var constructRequestPrototype = function () {
        var F = function () {
        };
        F.prototype = requestInterface;
        return new F();
    };

    /**
     * Constructs a new Init-REST-Call (/gamesession/init...)
     * @return {*}
     * @constructor
     */
    requestTypes.initRequest = function () {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7.portalInformation.getInitUrl();
        request.dtoObject = XCG.edict7.dtos().requestDTO("init");
        request.retryPolicy = 2;
        return request;
    };

    /**
     * Constructs a new Heartbeat-REST-Call.
     * @return {*}
     * @constructor
     */
    requestTypes.heartBeatRequest = function () {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7.portalInformation.getHeartbeatUrl();
        request.method = 'GET';
        return request;
    };

    /**
     * Constructs a new StartGameSession-REST-Call.
     * @return {*}
     * @constructor
     */
    requestTypes.startRequest = function () {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7.portalInformation.getStartUrl();
        request.dtoObject = XCG.edict7.dtos().joinSessionRequestDTO();
        //replaced by maven
        request.dtoObject["de.edict.eoc.gaming.comm.JoinSessionRequestDTO"].coreVersion = "${project.version}";
        return request;
    };

    /**
     * Constructs a new CloseGameSession-REST-Call.
     * @param gameSessionUuid Current gameSessionUuid
     * @return {*}
     * @constructor
     */
    requestTypes.closeRequest = function (gameSessionUuid) {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7.portalInformation.getCloseUrl();
        request.dtoObject = XCG.edict7.dtos().gameSessionRequestDTO('', gameSessionUuid, "close");
        return request;
    };

    /**
     * Constructs a new GetBalance-REST-Call.
     * @return {*}
     * @constructor
     */
    requestTypes.balanceRequest = function () {
        var request = constructRequestPrototype();
        //TODO gibt es dieses request?
        //request.urlPath = XCG.edict7.portalInformation.getBalanceUrl();
        request.urlPath = '';
        request.method = 'GET';
        return request;
    };

    /**
     * Constructs a new OnCommandGameSession-REST-Call.
     * @param gameData
     * @return {*}
     * @constructor
     */
    requestTypes.onCommandRequest = function (gameData) {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7.portalInformation.getOnCommandUrl();
        request.dtoObject = XCG.edict7.dtos().gameSessionRequestDTO(gameData, 'uuid', 'command');
        return request;
    };
    return requestTypes;
};

XCG.edict7.requestTypes = XCG.edict7.createRequestTypes();

/*************************************************************
 * xcg.edict7.validator
 *************************************************************/
XCG.edict7.validator = {

    isNotTypeString: function (object) {
        return typeof object !== 'string';
    },

    isNotTypeObject: function (object) {
        return typeof object !== 'object';
    },

    isNotTypeNumber: function (object) {
        return typeof object !== 'number';
    },

    isNotTypeBoolean: function (object) {
        return typeof object !== 'boolean';
    },

    isNotValidCommonData: function (dtoObject, dtoName) {
        return !XCG.edict7.validator.isValidCommonData(dtoObject, dtoName);
    },

    isValidCommonData: function (dtoObject, dtoName) {
        if (typeof dtoObject === 'object') {
            if (dtoObject.hasOwnProperty(dtoName)) {
                return true;
            }
        }
        return false;
    },

    isValidJoinSessionDTO: function (dtoObject) {
        if (XCG.edict7.validator.isNotValidCommonData(dtoObject, XCG.edict7.DTO_NAME_JOIN_SESSION)) {
            return false;
        }

        var joinSessionDto = dtoObject[XCG.edict7.DTO_NAME_JOIN_SESSION];
        if (XCG.edict7.validator.isNotTypeObject(joinSessionDto.depot)) {
            return false;
        }
        if (XCG.edict7.validator.isNotTypeNumber(joinSessionDto.depot.balance)) {
            return false;
        }
        if (typeof joinSessionDto.gameData !== 'undefined') {
            if (XCG.edict7.validator.isNotTypeString(joinSessionDto.gameData)) {
                return false;
            }
        }
        return true;
    },

    isValidGameClientActionDTO: function (dtoObject) {
        if (XCG.edict7.validator.isNotValidCommonData(dtoObject, XCG.edict7.DTO_NAME_GAME_CLIENT_ACTION)) {
            return false;
        }

        var gameClientActionDto = dtoObject[XCG.edict7.DTO_NAME_GAME_CLIENT_ACTION];
        if (XCG.edict7.validator.isNotTypeString(gameClientActionDto.gameData)) {
            return false;
        }
        if (XCG.edict7.validator.isNotTypeObject(gameClientActionDto.coreData)) {
            return false;
        }
        if (XCG.edict7.validator.isNotTypeObject(gameClientActionDto.coreData.depot)) {
            return false;
        }
        if (XCG.edict7.validator.isNotTypeNumber(gameClientActionDto.coreData.depot.balance)) {
            return false;
        }
        return !XCG.edict7.validator.isNotTypeBoolean(gameClientActionDto.coreData.isGameFinished);

    }

};

/*************************************************************
 * xcg.delegate7_1.gamblingMachineEnvironment
 *************************************************************/

XCG.edict7_1.createDelegateGamblingMachineEnvironment = function () {

    var startGameCallback;
    var commandDelegateFromGame;

    var commandCallbackProxy = function (actionCommand, value) {
        if (actionCommand === XCG.edict7_1.actionCommands.UPDATEDEPOT) {
            if (value === undefined){
                XCG.delegate7_1.gamblingMachineService.updateBalance();
            } else {
                XCG.delegate7_1.gamblingMachineService.updateBalance(value);
            }
        }
        commandDelegateFromGame(actionCommand);
    };

    /**
     * @class
     */
    var gamblingMachineEnvironment = {};

    /**
     * Calls startCallback when system is prepared.
     * <p/>
     * The startCallback is executed after the gambling machine environment.resumeStartUp is called async.
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
     * <body onload="XCG.api.gamblingMachineEnvironment.onPrepared(YOUR_GAME.start, YOUR_GAME.command)">
     *
     * @param startCallback  contains the start-game-logic
     * @param commandCallback contains the game-logic to handle external game commands (e.g 'pause', 'resume')
     * @param resizeCallback contains the functionality to resize the gameclient (parameters: x and y in pixels)
     */
    gamblingMachineEnvironment.onPrepared = function (startCallback, commandCallback, resizeCallback) {
        startGameCallback = startCallback;
        commandDelegateFromGame = commandCallback;
        XCG.delegate7_1.gamblingMachineService.setCommandCallback(commandCallbackProxy);
        XCG.delegate7_1.gamblingMachineService.setSizeChangedCallback(resizeCallback);
    };

    /*
     * Will be called XCG.edict7_1.windowMessageHandler once the portal has send the portalInformation.
     * The startCallback of the game will be called to inform the game about the finished initialization.
     * @param portalInfo The portalInformation object send by the portal.
     */
    gamblingMachineEnvironment.resumeStartUp = function (portalInfo) {
        XCG.debug.log('Start gameclient...');
        XCG.edict7_1.portalInformation = portalInfo;
        initHelpContent();
        initGameCallbacks();
        startGameCallback();
    };

    function initHelpContent() {
        var helpContentObject = XCG.edict7_1.portalInformation.getHelpContent();
        if (helpContentObject instanceof jQuery) {
            helpContentObject = helpContentObject.wrapAll('<div>').parent().html();
        }
        XCG.delegate7_1.gamblingMachineSpecification.setHelpContent(helpContentObject);
    }

    function initGameCallbacks() {
        //Give the portal the core proxy functions to use the same code for both types of communication
        XCG.edict7_1.portalInformation.setCommandCallback(XCG.delegate7_1.gamblingMachineService.sendCommandToGame);
        XCG.edict7_1.portalInformation.setSizeChangedCallback(function (x, y) {
            XCG.delegate7_1.gamblingMachineService.informGameOfResize({width: x, height: y});
        });
    }

    return gamblingMachineEnvironment;
};

XCG.delegate7_1.gamblingMachineEnvironment = XCG.edict7_1.createDelegateGamblingMachineEnvironment();

/*************************************************************
 * xcg.delegate7_1.gamblingMachineService
 *************************************************************/

XCG.edict7_1.createDelegateGamblingMachineService = function () {

    /**
     * @class Gambling Machine Service
     */
    var gamblingMachineService = {};
    var currentGameSessionUuid = '';
    var depotBalance = 0;
    var limitedDepotBalance = 0;
    //Init minimalStake with -1 to detect unsupported game spec information
    var minimalStake = -1;
    //Game callbacks
    var gameClientSizeChangedCallback;
    var actionCommandCallback;

    XCG.edict7_1.slotSession = {};

    var setDepotBalances = function (depotDTO) {
        limitedDepotBalance = depotDTO.limitBalance;
        depotBalance = depotDTO.balance;
    };

    var doBalanceCheck = function () {
        if (minimalStake !== -1) {
            if (limitedDepotBalance < minimalStake) {
                XCG.debug.log('Balance is now lower than the minimal stake of  ' + minimalStake);
                XCG.edict7_1.portalInformation.balanceTooLow();
            }
        } else {
            XCG.debug.log('Game or portal does not support balanceTooLow operation');
        }
    };

    var handleSlotSession = function (dtoObject) {
        if (!XCG.edict7_1.isEmpty(dtoObject.slotSession)) {
            XCG.edict7_1.slotSession = dtoObject.slotSession;
        } else {
            XCG.debug.log('Response contains no slotSession information.');
            XCG.edict7_1.slotSession = {};
        }
        gameFrame.htmlGameCommunicator.slotSessionTimerRunning = false;
        gameFrame.htmlGameCommunicator.updateSlotSessionGUI();
    };

    var handleCasinoFreespin = function (casinoFreespinData) {
        gameStart.CasinoFreespinsLayer.updateGUI(casinoFreespinData);
    };

    var handleBusinessException = function (responseDTO) {
        var propName;
        var prop;
        if (responseContainsBusinessException(responseDTO)) {
            for (propName in responseDTO) {
                prop = responseDTO[propName];
                XCG.edict7_1.errors.handleError(prop.error);
                break;
            }
        }
    };

    var responseContainsBusinessException = function (responseDTO) {
        var propName;
        var prop;
        var hasException = false;
        for (propName in responseDTO) {
            prop = responseDTO[propName];
            if (typeof prop.error !== 'undefined') {
                hasException = true;
                break;
            }
        }
        return hasException;
    };

    var proofDTO = function (dtoObject, validatorFunction) {
        var isValid = validatorFunction(dtoObject);
        if (!isValid) {
            XCG.edict7_1.errors.handleError(XCG.edict7_1.errors.generateDeSerializationErrorDTO());
        }
        return isValid;
    };

    gamblingMachineService.updateBalance = function (depotDTO) {
        if (depotDTO !== undefined) {
            setDepotBalances(depotDTO);
        } else {
            var response = XCG.edict7_1.connector.sendCoreRequest(XCG.edict7_1.requestTypes.balanceRequest());
            if (response) {
                setDepotBalances(response[XCG.edict7_1.DTO_NAME_DEPOT]);
            }
        }
    };

    /**
     * Starts the javascript-core-engine.
     * <p/>
     * The GamblingMachine backend will be initialized and started.
     *
     * @return game data from GamblingMachine backend for initialization for the game client
     */
    gamblingMachineService.start = function () {
        XCG.debug.log('Start JS gambling machine...');
        //Reset currentGameSessionUuid
        currentGameSessionUuid = '';
        var response;
        var dtoObject;
        var connector = XCG.edict7_1.connector;
        var isValidJoinSessionDTO;
        connector.setGamingCookies(XCG.edict7_1.portalInformation.requiredCookies);
        connector.sendCoreRequest(XCG.edict7_1.requestTypes.initRequest());
        response = connector.sendCoreRequest(XCG.edict7_1.requestTypes.startRequest());
        if (response) {
            if (responseContainsBusinessException(response)) {
                handleBusinessException(response);
            } else {
                isValidJoinSessionDTO = proofDTO(response, XCG.edict7_1.validator.isValidJoinSessionDTO);
                if (isValidJoinSessionDTO) {
                    dtoObject = response[XCG.edict7_1.DTO_NAME_JOIN_SESSION];
                    currentGameSessionUuid = dtoObject.gameSessionUuid;
                    setDepotBalances(dtoObject.depot);
                    if ('gameSpecs' in dtoObject) {
                        minimalStake = dtoObject.gameSpecs.minimalStake;
                    }
                    XCG.edict7_1.messaging.handleMessages(dtoObject, function () {
                    });

                    gameStart.heartbeatTimer.start();
                    handleSlotSession(dtoObject);
                    return (typeof dtoObject.gameData !== 'undefined') ? dtoObject.gameData : null;
                }
            }
        }
        return null;
    };


    gamblingMachineService.stop = function () {
        var connector = XCG.edict7_1.connector;
        gameStart.heartbeatTimer.stop();
        connector.sendCoreRequest(XCG.edict7_1.requestTypes.closeRequest(currentGameSessionUuid));
        XCG.edict7_1.portalInformation.closeGameClient();
    };

    gamblingMachineService.send = function (gameData, callback, synchron) {
        var connector = XCG.edict7_1.connector;
        var onRequestCallback = function (responseData) {

            if (responseData) {
                if (responseContainsBusinessException(responseData)) {
                    handleBusinessException(responseData);
                } else {
                    var gameClientActionResponseDTO = responseData[XCG.edict7_1.DTO_NAME_GAME_CLIENT_ACTION];
                    if (gameClientActionResponseDTO) {
                        var isValidGameClientActionDTO = proofDTO(responseData, XCG.edict7_1.validator.isValidGameClientActionDTO);
                        if (isValidGameClientActionDTO) {
                            connector.blockGameRequests();
                            XCG.edict7_1.messaging.handleMessages(gameClientActionResponseDTO, function () {
                                connector.unblockGameRequests();
                                setDepotBalances(gameClientActionResponseDTO.coreData.depot);
                                doBalanceCheck();
                                handleSlotSession(gameClientActionResponseDTO);
                                handleCasinoFreespin(gameClientActionResponseDTO.freespinInfo);
                                callback(gameClientActionResponseDTO.gameData);
                            });
                        }
                    }
                }
            }
        };
        connector.sendGameRequest(XCG.edict7_1.requestTypes.onCommandRequest(gameData), onRequestCallback, synchron);
    };


    /**
     * Returns the full depot balance.
     * @returns {number}
     */
    gamblingMachineService.getDepotBalance = function () {
        return depotBalance;
    };

    /**
     * Returns the limited depot balance.
     * needs to be shown by the gameclient seperately when value differs from
     * the value which getDepotBalance returns
     * @returns {number}
     */
    gamblingMachineService.getLimitedDepotBalance = function () {
        return limitedDepotBalance;
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
        XCG.edict7_1.messaging.showSuppressedCasinoMessages(resumeCallback);
    };

    /**
     * Request minimization of the Client. This is only possible, if client is maximized.
     * After size change is completed, the resizeCallback will be called.
     */
    gamblingMachineService.minimizeClient = function () {
        XCG.edict7_1.portalInformation.minimizeClient();
    };

    /**
     * Request maximization of the Client. This is only possible, if client is minimized.
     * After size change is completed, the resizeCallback will be called.
     */
    gamblingMachineService.maximizeClient = function () {
        XCG.edict7_1.portalInformation.maximizeClient();
    };

    /**
     * Must be called when the animation of a new game round has been started
     * to inform the portal environment about that.
     */
    gamblingMachineService.gameRoundStarted = function () {
        XCG.debug.log('gameRoundStarted event received');
        XCG.edict7_1.portalInformation.gameRoundStarted();
    };

    /**
     * Must be called when the animation of a game round has been ended
     * to inform the portal environment about that.
     */
    gamblingMachineService.gameRoundEnded = function () {
        XCG.debug.log('gameRoundEnded event received');
        XCG.edict7_1.portalInformation.gameRoundEnded();
    };

    /**
     * Must be called when the animation of a game round has been ended
     * to inform the portal environment about that.
     */
    gamblingMachineService.winUpdated = function (value) {
        XCG.debug.log('winUpdated event received. New Value:' + value);
        XCG.edict7_1.portalInformation.winUpdated(value);
    };

    /**
     * Must be called when the stake has been updated
     * to inform the portal environment about that.
     */
    gamblingMachineService.stakeUpdated = function (value) {
        XCG.debug.log('stakeUpdated event received');
        XCG.edict7_1.portalInformation.stakeUpdated(value);
    };

    /**
     * Must be called when the user has unmuted the sound
     */
    gamblingMachineService.audioEnabled = function () {
        XCG.debug.log('audio enabled');
        XCG.edict7_1.portalInformation.audioEnabled();
    };

    /**
     * Must be called when the user has muted the sound
     */
    gamblingMachineService.audioDisabled = function () {
        XCG.debug.log('audio disabled');
        XCG.edict7_1.portalInformation.audioDisabled();
    };

    /**
     * Requests the logout of the current player from the portal
     * @param reason Optional reason for log out.
     */
    gamblingMachineService.logoutPortalUser = function (reason) {
        XCG.edict7_1.portalInformation.logoutPortalUser();
    };

    /**
     * Requests to present the ResponsibleGamingUrl from the portal
     * */
    gamblingMachineService.openResponsibleGamingUrl = function () {
        XCG.edict7_1.portalInformation.openResponsibleGamingUrl();
    };

    /**
     * Show abortion message and close game client.
     * </p>
     * This function should be called if
     * - resources could not be loaded
     * - unexpected errors occurred
     */
    gamblingMachineService.abortGame = function () {
        XCG.edict7_1.connector.sendCoreRequest(XCG.edict7_1.requestTypes.closeRequest(currentGameSessionUuid));
        XCG.edict7_1.errors.handleError(XCG.edict7_1.errors.generateLoadErrorDTO());
    };

    /**
     * set for gameClientSizeChangedCallback
     * @param sizeChangedCallback Callback given by game during onPrepared
     */
    gamblingMachineService.setSizeChangedCallback = function (sizeChangedCallback) {
        gameClientSizeChangedCallback = sizeChangedCallback;
    };

    /**
     * set for CommandCallback
     * @param commandCallback Callback given by game during onPrepared
     */
    gamblingMachineService.setCommandCallback = function (commandCallback) {
        actionCommandCallback = commandCallback;
    };

    /**
     * Sends the given command to the game via the actionCommandCallback.
     *
     * @param {string} command Command name to send
     */
    gamblingMachineService.sendCommandToGame = function (command, value) {
        actionCommandCallback(command, value);
    };


    /**
     * Informs the game about the changes for the size of the game layer.
     * @param {object} size Size with width and height
     */
    gamblingMachineService.informGameOfResize = function (size) {
        gameClientSizeChangedCallback(size.width, size.height);
    };

    return gamblingMachineService;
};

/**
 * Gambling Machine Service used to start a game.
 */
XCG.delegate7_1.gamblingMachineService = XCG.edict7_1.createDelegateGamblingMachineService();

/*************************************************************
 * xcg.delegate7_1.gamblingMachineSpecification
 *************************************************************/

XCG.edict7_1.createDelegateGamblingMachineSpecification = function () {

    var helpContent;

    /**
     * @class
     */
    var gamblingMachineSpecification = {};

    /**
     * Returns locale for language specific things in game client
     *
     * @returns locale format is Java Locale format
     */
    gamblingMachineSpecification.getLocale = function () {
        return XCG.edict7_1.portalInformation.getLocale();
    };

    /**
     * Returns true if translation for key exists. The translation is only available for the user chosen language.
     *
     * @param key   translation key
     * @returns translation-map
     * @deprecated shouldn't be used, because the games are supposed to bring their own translations
     */
    gamblingMachineSpecification.hasTranslation = function (key) {
        return XCG.edict7_1.portalInformation.getTranslations().hasOwnProperty(key);
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
        if (this.hasTranslation(key)) {
            return XCG.edict7_1.portalInformation.getTranslations()[key];
        }
        return key;
    };

    /**
     * Returns display height and width usable for game.
     *
     * @returns object with height and width
     */
    gamblingMachineSpecification.getDisplaySize = function () {
        return {
            height: document.documentElement.clientHeight,
            width: document.documentElement.clientWidth
        };
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
        return XCG.edict7_1.portalInformation.getCurrency();
    };

    /**
     * @return returns the jurisdiction. E.g. "IoM" or "ES"
     */
    gamblingMachineSpecification.getJurisdiction = function () {
        return XCG.edict7_1.portalInformation.getJurisdiction();
    };

    /**
     * Returns help text for current game.
     * @deprecated Since version 6.6. Will be deleted soon. Use getJurisdiction() and getLocale() information in order to provide help content yourself.
     * @returns     help text
     */
    gamblingMachineSpecification.getHelpContent = function () {
        XCG.edict7_1.logWarning('Deprecated call to gamblingMachineSpecification.getHelpContent(), please call gamblingMachineSpecification.getJurisdiction() and gamblingMachineSpecification.getLocale() and use this information in order to provide help content yourself.');
        return helpContent;
    };

    gamblingMachineSpecification.setHelpContent = function (htmlString) {
        var $fragment = $(htmlString);
        helpContent = $fragment;
    };


    /**
     * Returns casino option value.
     *
     * @param key   for casino option
     * @returns     value of casino option
     */
    gamblingMachineSpecification.getCasinoOption = function (key) {
        return XCG.edict7_1.portalInformation.getDomainOption(key);
    };

    /**
     * Returns responsible gaming url.
     * @deprecated use function openResponsibleGamingUrl in gamblingMachineService
     * */
    gamblingMachineSpecification.openResponsibleGamingUrl = function () {
        XCG.edict7_1.logWarning('Deprecated call to gamblingMachineSpecification.openResponsibleGamingUrl, please call XCG.delegate7_1.gamblingMachineService.openResponsibleGamingUrl instead!');
        XCG.delegate7_1.gamblingMachineService.openResponsibleGamingUrl();
    };

    /**
     * Returns if DomainOption "Responsible Gaming" is active
     *
     * @returns true if ResponsibleGaming is active, otherwise false
     */
    gamblingMachineSpecification.isResponsibleGamingActive = function () {
        return XCG.edict7_1.portalInformation.isResponsibleGamingActive();
    };

    /**
     * Returns the customizable path to the Responsible Gaming Icon
     *
     * @returns String with Path To Icon for Responsible Gaming
     * */
    gamblingMachineSpecification.getResponsibleGamingIconPath = function () {
        return XCG.edict7_1.portalInformation.getResponsibleGamingIconPath();
    };

    /**
     * Requests the logout of the current player from the portal
     * @deprecated use function logoutPortalUser in gamblingMachineService
     * @param reason
     */
    gamblingMachineSpecification.logoutPortalUser = function (reason) {
        XCG.edict7_1.logWarning('Deprecated call to gamblingMachineSpecification.logoutPortalUser, please call XCG.delegate7_1.gamblingMachineService.logoutPortalUser instead!');
        XCG.delegate7_1.gamblingMachineService.logoutPortalUser(reason);
    };

    return gamblingMachineSpecification;
};

XCG.delegate7_1.gamblingMachineSpecification = XCG.edict7_1.createDelegateGamblingMachineSpecification();

/*************************************************************
 * XCG.delegate7_1.layoutSpecification
 *************************************************************/

XCG.edict7_1.createLayoutSpecification = function () {
    /**
     * @class layout specification
     */
    var layoutSpecification = {};

    layoutSpecification.depotBalanceVisible = function () {
        return XCG.edict7_1.portalInformation.layout.depotBalanceVisible;
    };
    layoutSpecification.stakeVisible = function () {
        return XCG.edict7_1.portalInformation.layout.stakeVisible;
    };
    layoutSpecification.winVisible = function () {
        return XCG.edict7_1.portalInformation.layout.winVisible;
    };
    layoutSpecification.coinSizesEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.coinSizesEnabled;
    };
    layoutSpecification.lineEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.lineEnabled;
    };
    layoutSpecification.maxBetEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.maxBetEnabled;
    };
    layoutSpecification.autoplayEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.autoplayEnabled;
    };
    layoutSpecification.spinEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.spinEnabled;
    };
    layoutSpecification.fullscreenEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.fullscreenEnabled;
    };
    layoutSpecification.soundEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.soundEnabled;
    };
    layoutSpecification.homeEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.homeEnabled;
    };
    layoutSpecification.paytableEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.paytableEnabled;
    };
    layoutSpecification.helpEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.helpEnabled;
    };
    layoutSpecification.fastSpinEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.fastSpinEnabled;
    };
    layoutSpecification.gambleEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.gambleEnabled;
    };
    layoutSpecification.riskLadderEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.riskLadderEnabled;
    };
    layoutSpecification.collectEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.collectEnabled;
    };
    layoutSpecification.responsibleGamingEnabled = function () {
        return XCG.edict7_1.portalInformation.layout.responsibleGamingEnabled;
    };
    return layoutSpecification;
};

/**
 * the layout specification contained some configurations to define the layout of the client.
 * it included the configuration of domain options and player options to display buttons
 */
XCG.delegate7_1.layoutSpecification = XCG.edict7_1.createLayoutSpecification();

/*************************************************************
 * xcg.edict7_1.dtos
 *************************************************************/
XCG.edict7_1.dtos = function () {

    var coreVersion = "2.4.js-SNAPSHOT";

    var gameInfo = function () {
        return {
            gameVersion: 0,
            gameManufacturer: 'unused',
            gameType: 'unused'
        };
    };

    return {

        joinSessionRequestDTO: function () {
            //TODO gameTemplateName and game info are not used by API 2.0 games. Check if the backend accepts the request even if these values are not present
            return {
                "de.edict.eoc.gaming.comm.JoinSessionRequestDTO": {
                    command: 'start',
                    coreVersion: coreVersion,
                    gameInfo: gameInfo(),
                    gameTemplateName: ''
                }
            };
        },

        gameSessionRequestDTO: function (gameData, uuid, command) {
            return {
                "de.edict.eoc.gaming.comm.GameSessionRequestDTO": {
                    command: command,
                    gameData: gameData,
                    gameSessionUuid: uuid
                }
            };
        },

        requestDTO: function (commandName) {
            return {
                "de.edict.eoc.gaming.comm.RequestDTO": {
                    command: commandName
                }
            };
        }

    };

};

/*************************************************************
 * xcg.edict7_1.errors
 *************************************************************/
XCG.edict7_1.errors = {};

XCG.edict7_1.errors.generateServerErrorDTO = function (response) {
    var errorMessage = XCG.edict7_1.errors.type.ERROR_RPC_IO;
    if ( response.responseJSON){
        errorMessage = response.responseJSON.errorResponseDTO.returnMsg;
    }
    return {
        type: XCG.edict7_1.errors.type.ERROR_RPC_IO,
        priority: XCG.edict7_1.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7_1.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: errorMessage,
        messageId: -1
    };
};

XCG.edict7_1.errors.generateCommunicationErrorDTO = function (response) {
    var errorMessage = XCG.edict7_1.errors.type.ERROR_RPC_HTTP;
    if ( response.responseJSON){
           errorMessage = response.responseJSON.errorResponseDTO.returnMsg;
       }
    return {
        type: XCG.edict7_1.errors.type.ERROR_RPC_HTTP,
        priority: XCG.edict7_1.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7_1.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: errorMessage,
        messageId: -1,
        createdByFramework: true
    };
};

XCG.edict7_1.errors.generateConnectionLostErrorDTO = function (response) {
    var errorMessage = XCG.edict7_1.errors.type.ERROR_CONNECTION_FAILED;
    if ( response.responseJSON){
        errorMessage = response.responseJSON.errorResponseDTO.returnMsg;
    }
    return {
        type: XCG.edict7_1.errors.type.ERROR_CONNECTION_FAILED,
        priority: XCG.edict7_1.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7_1.errors.gameClientAction.RESTART,
        title: "ERROR",
        text: errorMessage,
        messageId: -1,
        params: [{ key: 'UI_ELEMENT', stringVal: 'BUTTON_RELOAD' }]
    };
};

XCG.edict7_1.errors.generateDeSerializationErrorDTO = function () {
    return {
        type: XCG.edict7_1.errors.type.ERROR_RPC_DESERIALIZATION,
        priority: XCG.edict7_1.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7_1.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: XCG.edict7_1.errors.type.ERROR_RPC_DESERIALIZATION,
        messageId: -1
    };
};

XCG.edict7_1.errors.generateLoadErrorDTO = function () {
    return {
        type: XCG.edict7_1.errors.type.ERROR_LOAD,
        priority: XCG.edict7_1.errors.priority.HIGHEST,
        gameClientAction: XCG.edict7_1.errors.gameClientAction.CLOSE,
        title: "ERROR",
        text: XCG.edict7_1.errors.type.ERROR_LOAD,
        messageId: -1
    };
};

XCG.edict7_1.errors.priority = {
    HIGHEST: "HIGHEST"
};

XCG.edict7_1.errors.gameClientAction = {
    CLOSE: "CLOSE",
    RESTART: "RESTART"
};

XCG.edict7_1.errors.type = {
    ERROR_RPC_IO: "ERROR_RPC_IO",
    ERROR_RPC_HTTP: "ERROR_RPC_HTTP",
    ERROR_RPC_DESERIALIZATION: "ERROR_RPC_DESERIALIZATION",
    ERROR_LOAD: "ERROR_LOAD",
    ERROR_CONNECTION_FAILED: "ERROR_CONNECTION_FAILED"
};


XCG.edict7_1.errors.handleError = function (messageDTO) {
    var closeGameClientCallback = null;
    closeGameClientCallback = function () {
        XCG.edict7_1.portalInformation.closeGameClient();
    };
     var messageArray = [];
    messageArray.push(messageDTO);
    XCG.edict7_1.messaging.sendMessages(messageArray,closeGameClientCallback);
};

/*************************************************************
 * xcg.edict
 *************************************************************/

XCG.edict7_1.CONTENT_TYPE = "Content-Type";

XCG.edict7_1.APPLICATION_JSON = "application/json";

XCG.edict7_1.RESPONSE_OK_LOWER_BOUNDARY = 200;
XCG.edict7_1.RESPONSE_OK_UPPER_BOUNDARY = 226;
XCG.edict7_1.RESPONSE_CONNECTION_ERROR_LOWER_BOUNDARY = 400;
XCG.edict7_1.RESPONSE_CONNECTION_ERROR_UPPER_BOUNDARY = 499;
XCG.edict7_1.RESPONSE_SERVER_ERROR_LOWER_BOUNDARY = 500;
XCG.edict7_1.RESPONSE_SERVER_ERROR_UPPER_BOUNDARY = 599;

XCG.edict7_1.RESPONSE_REQUEST_TIMEOUT = 408;
XCG.edict7_1.RESPONSE_CLIENT_ERROR = 0;

XCG.edict7_1.DTO_NAME_JOIN_SESSION = "de.edict.eoc.gaming.comm.JoinSessionResponseDTO";
XCG.edict7_1.DTO_NAME_GAME_CLIENT_ACTION = "de.edict.eoc.gaming.comm.GameClientActionResponseDTO";
XCG.edict7_1.DTO_NAME_RESPONSE = "de.edict.eoc.gaming.comm.ResponseDTO";
XCG.edict7_1.DTO_NAME_HAERTBEAT_RESPONSE = "de.edict.eoc.gaming.comm.HeartbeatResponseDTO";
XCG.edict7_1.DTO_NAME_DEPOT = "de.edict.eoc.gaming.comm.DepotDTO";
XCG.edict7_1.actionCommands = {
            PAUSE: 'pause',
            RESUME: 'resume',
            UPDATEDEPOT: 'updateDepot',
            ENABLEAUDIO: 'enableAudio',
            DISABLEAUDIO: 'disableAudio',
            SHOWHELP: 'showHelp',
            TOGGLEPAYTABLE: 'togglePaytable',
            STARTGAME: 'startGame'
        };
XCG.edict7_1.portalRequests = {
            PORTALINFORMATION: 'requestPortalInformation',
            HELP_CONTENT: 'requestHelpContent',
            BALANCE_TO_LOW: 'balanceTooLow',
            CLOSE_GAME_CLIENT: 'closeGameClient',
            MINIMIZE_CLIENT: 'minimizeClient',
            MAXMIZE_CLIENT: 'maximizeClient',
            GAME_ROUND_STARTED: 'gameRoundStarted',
            GAME_ROUND_ENDED: 'gameRoundEnded',
            GAME_LOADING_STARTED: 'gameLoadingStarted',
            GAME_LOADING_ENDED: 'gameLoadingEnded',
            LOGOUT_USER: 'logoutUser',
            OPEN_RESP_GAMING_URL: 'openResponsibleGamingUrl',
            SEND_MESSAGES: 'showMessages'
        };
XCG.edict7_1.portalInformation = null;

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

XCG.edict7_1.logWarning = function (logMessage) {
    if (console){
        console.warn(logMessage);
    }
};

XCG.edict7_1.isEmpty = function (obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

/*************************************************************
 * xcg.edict7_1.messaging
 *************************************************************/
XCG.edict7_1.createMessaging = function () {
    var messaging = {};
    var suppressedMessages = [];
    var resumeCallback;

    messaging.handleMessages = function (dtoObject, resumeCallbackFromGame) {
        resumeCallback = resumeCallbackFromGame;
        var messages = getMessagesFromResponseDTO(dtoObject);
        if (messages.length > 0) {
            handleMessages(messages);
        }
        resumeCallback();
    };

    messaging.handleMessages4HeartBeat = function (dtoObject) {
        var messages = getMessagesFromResponseDTO(dtoObject);
        if (messages.length > 0) {
            handleMessages(messages);
        }
    };

    function getMessagesFromResponseDTO(responseDTO) {
        var messagesArray;

        //check if we have a core object, if so get the messages list from there, otherwiese get messages directly from dto
        if (typeof responseDTO.coreData === 'object') {
            messagesArray = responseDTO.coreData.messages;
        } else {
            messagesArray = responseDTO.messages;
        }

        //make sure that we always return an array even if the dto does not cointain any messages
        if (typeof messagesArray !== 'undefined') {
            //fix for marshalling bug. array is a single object if only one message is present
            if (typeof messagesArray.length === 'undefined') {
                messagesArray = [messagesArray];
            }
        } else {
            messagesArray = [];
        }

        return messagesArray;
    }

    var handleMessages = function (messages) {
        var suppressedMessages = messages.filter(function (messageDTO) {
            return (messageDTO.priority === 'HIGHEST' || messageDTO.priority === 'ULTRA');
        });
        var filteredMessages = messages.filter(function (messageDTO) {
            return (messageDTO.priority !== 'HIGHEST' && messageDTO.priority !== 'ULTRA');
        });
        handleSuppressedMessages(suppressedMessages);
        if (filteredMessages.length > 0) {
            // messaging.sendMessages(filteredMessages);
            for (var i = 0; i < filteredMessages.length; i++) {
                gameFrame.displayGrowlMessageByTheWay(filteredMessages[i]);
            }
        }
    };

    function handleSuppressedMessages(messages) {
        for (var i = 0; i < messages.length; i++) {
            var messageAlreadyInQueue = false;
            var message = messages[i];
            for (var j = 0; j < suppressedMessages.length; j++) {
                if (suppressedMessages[j].messageId === message.messageId) {
                    messageAlreadyInQueue = true;
                    break;
                }
            }
            if (!messageAlreadyInQueue) {
                suppressedMessages.push(message);
            }
        }
    }

    /**
     * Sends the messages to the portal for displaying.
     * @param {array} messages  List of messages
     * @param {type} alternativeResumeCallback Optional callback to overwrite current.
     */
    messaging.sendMessages = function (messages, alternativeResumeCallback) {
        if (typeof alternativeResumeCallback === 'function') {
            XCG.debug.log('Use alternative resume callback');
            resumeCallback = alternativeResumeCallback;
        }
        var dummyCallback = function () {
        };
        XCG.edict7_1.portalInformation.showMessages(messages, dummyCallback, resumeCallback);
    };

    messaging.resumeGamePlay = function () {
        XCG.debug.log('Inform game about resuming game play.');
        resumeCallback();
    };

    messaging.showSuppressedCasinoMessages = function (resumeCallback) {
        if (suppressedMessages.length > 0) {
            messaging.sendMessages(suppressedMessages, resumeCallback);
            suppressedMessages = [];
        } else {
            //Nothing to do so resume instantly.
            resumeCallback();
        }
    };

    return messaging;
};

XCG.edict7_1.messaging = XCG.edict7_1.createMessaging();

/*************************************************************
 * xcg.edict7_1.requestTypes
 *************************************************************/
XCG.edict7_1.createRequestTypes = function () {

    var requestTypes = {};

    /**
     * Interface used as a prototype of all concrete Request-Types.
     * One Request-Type implements one specific REST-Call.
     * urlPath contains the path, to where the REST-Call should be send.
     * dtoObject contains the body that should be included in the REST-Call.
     * retryPolicy contains the number of retries for the request-type.
     * @type {{urlPath: string, dtoObject: string, retryPolicy: number}}
     */
    var requestInterface = {
        urlPath: "",
        dtoObject: "",
        retryPolicy: 0,
        method: "POST"
    };

    /**
     * Constructs an object with prototype.
     * @return {F}
     */
    var constructRequestPrototype = function () {
        var F = function () {
        };
        F.prototype = requestInterface;
        return new F();
    };

    /**
     * Constructs a new Init-REST-Call (/gamesession/init...)
     * @return {*}
     * @constructor
     */
    requestTypes.initRequest = function () {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7_1.portalInformation.getInitUrl();
        request.dtoObject = XCG.edict7_1.dtos().requestDTO("init");
        request.retryPolicy = 2;
        return request;
    };

    /**
     * Constructs a new Heartbeat-REST-Call.
     * @return {*}
     * @constructor
     */
    requestTypes.heartBeatRequest = function () {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7_1.portalInformation.getHeartbeatUrl();
        request.method = 'GET';
        return request;
    };

    /**
     * Constructs a new StartGameSession-REST-Call.
     * @return {*}
     * @constructor
     */
    requestTypes.startRequest = function () {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7_1.portalInformation.getStartUrl();
        request.dtoObject = XCG.edict7_1.dtos().joinSessionRequestDTO();
        //replaced by maven
        request.dtoObject["de.edict.eoc.gaming.comm.JoinSessionRequestDTO"].coreVersion = "${project.version}";
        return request;
    };

    /**
     * Constructs a new CloseGameSession-REST-Call.
     * @param gameSessionUuid Current gameSessionUuid
     * @return {*}
     * @constructor
     */
    requestTypes.closeRequest = function (gameSessionUuid) {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7_1.portalInformation.getCloseUrl();
        request.dtoObject = XCG.edict7_1.dtos().gameSessionRequestDTO('', gameSessionUuid, "close");
        return request;
    };

    /**
     * Constructs a new GetBalance-REST-Call.
     * @return {*}
     * @constructor
     */
    requestTypes.balanceRequest = function () {
        var request = constructRequestPrototype();
        //TODO gibt es dieses request?
        request.urlPath = XCG.edict7_1.portalInformation.getBalanceUrl();
        request.method = 'GET';
        return request;
    };

    /**
     * Constructs a new OnCommandGameSession-REST-Call.
     * @param gameData
     * @return {*}
     * @constructor
     */
    requestTypes.onCommandRequest = function (gameData) {
        var request = constructRequestPrototype();
        request.urlPath = XCG.edict7_1.portalInformation.getOnCommandUrl();
        request.dtoObject = XCG.edict7_1.dtos().gameSessionRequestDTO(gameData, 'uuid', 'command');
        return request;
    };
    return requestTypes;
};

XCG.edict7_1.requestTypes = XCG.edict7_1.createRequestTypes();

/*************************************************************
 * xcg.edict7_1.validator
 *************************************************************/
XCG.edict7_1.validator = {

    isNotTypeString: function (object) {
        return typeof object !== 'string';
    },

    isNotTypeObject: function (object) {
        return typeof object !== 'object';
    },

    isNotTypeNumber: function (object) {
        return typeof object !== 'number';
    },

    isNotTypeBoolean: function (object) {
        return typeof object !== 'boolean';
    },

    isNotValidCommonData: function (dtoObject, dtoName) {
        return !XCG.edict7_1.validator.isValidCommonData(dtoObject, dtoName);
    },

    isValidCommonData: function (dtoObject, dtoName) {
        if (typeof dtoObject === 'object') {
            if (dtoObject.hasOwnProperty(dtoName)) {
                return true;
            }
        }
        return false;
    },

    isValidJoinSessionDTO: function (dtoObject) {
        if (XCG.edict7_1.validator.isNotValidCommonData(dtoObject, XCG.edict7_1.DTO_NAME_JOIN_SESSION)) {
            return false;
        }

        var joinSessionDto = dtoObject[XCG.edict7_1.DTO_NAME_JOIN_SESSION];
        if (XCG.edict7_1.validator.isNotTypeObject(joinSessionDto.depot)) {
            return false;
        }
        if (XCG.edict7_1.validator.isNotTypeNumber(joinSessionDto.depot.balance)) {
            return false;
        }
        if (typeof joinSessionDto.gameData !== 'undefined') {
            if (XCG.edict7_1.validator.isNotTypeString(joinSessionDto.gameData)) {
                return false;
            }
        }
        return true;
    },

    isValidGameClientActionDTO: function (dtoObject) {
        if (XCG.edict7_1.validator.isNotValidCommonData(dtoObject, XCG.edict7_1.DTO_NAME_GAME_CLIENT_ACTION)) {
            return false;
        }

        var gameClientActionDto = dtoObject[XCG.edict7_1.DTO_NAME_GAME_CLIENT_ACTION];
        if (XCG.edict7_1.validator.isNotTypeString(gameClientActionDto.gameData)) {
            return false;
        }
        if (XCG.edict7_1.validator.isNotTypeObject(gameClientActionDto.coreData)) {
            return false;
        }
        if (XCG.edict7_1.validator.isNotTypeObject(gameClientActionDto.coreData.depot)) {
            return false;
        }
        if (XCG.edict7_1.validator.isNotTypeNumber(gameClientActionDto.coreData.depot.balance)) {
            return false;
        }
        return !XCG.edict7_1.validator.isNotTypeBoolean(gameClientActionDto.coreData.isGameFinished);

    }

};

/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright © edict egaming GmbH, Hamburg (Germany) [2014]
 */
/* -------------------------------------------------------- */
/*                                                          */
/*                        Tools Module                      */
/* Contains methods that overrides jquery and js functions  */
/* -------------------------------------------------------- */


/**
 * Copyright (c) 2006-2007 Mathias Bank (http://www.mathias-bank.de)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Version 2.1
 */
jQuery.fn.extend({
    /*
     * Returns get parameters.
     * If the desired param does not exist, null will be returned
     * To get the document params: * @example value = $(document).getUrlParam('paramName');
     *
     * To get the params of a html-attribut (uses src attribute) * @example value = $('#imgLink').getUrlParam('paramName');
     */
    getUrlParam: function (strParamName) {
        strParamName = escape(unescape(strParamName));
        var returnVal = [];
        var qString = null;
        if ($(this).attr('nodeName') === '#document') {
            //document-handler
            if (window.location.search.search(strParamName) > -1) {
                qString = window.location.search.substr(1, window.location.search.length).split('&');
            }
        } else if ($(this).attr('src') !== 'undefined') {
            var strHref = $(this).attr('src');
            if (strHref.indexOf('?') > -1) {
                var strQueryString = strHref.substr(strHref.indexOf('?') + 1);
                qString = strQueryString.split('&');
            }
        } else if ($(this).attr('href') !== 'undefined') {

            var strHref = $(this).attr('href');
            if (strHref.indexOf('?') > -1) {
                var strQueryString = strHref.substr(strHref.indexOf('?') + 1);
                qString = strQueryString.split('&');
            }
        } else {
            return null;
        }
        if (qString == null) {
            return null;
        }
        for (var i = 0; i < qString.length; i++) {
            if (escape(unescape(qString[i].split('=')[0])) == strParamName) {
                returnVal.push(qString[i].split('=')[1]);
            }
        }
        if (returnVal.length === 0) {
            return null;
        } else if (returnVal.length === 1) {
            return returnVal[0];
        } else {
            return returnVal;
        }
    }
});

String.prototype.startsWith = function (str) {
    return (this.match('^' + str) === str);
};

//fix for ie8 which cannot handle the method indexOf for arrays
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0) {
            from += len;
        }

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt) {
                return from;
            }
        }
        return -1;
    };
}

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
var gameStart = gameStart || {};
gameStart.browserDetect = {};
gameStart.debug = true;
gameStart.servicesGamingPath = '';

gameStart.htmlContainerId = {
    edictGameLayer: 'edict_game_layer',
    gameLayer: 'edict_iframe',
    gameLayerTopBar: 'edict_top_bar',
    gameLayerRegulationPanel: 'edict_regulation_panel',
    gameLayerResponsibleGaming: 'edict_responsibleGaming',
    gameLayerSlotSessionLimit: 'edict_slot_session_limit',
    gameLayerSlotSessionRemainingTimeActive: 'slotSessionRemainingTimeActive',
    gameLayerSlotSessionRemainingLimitActive: 'slotSessionRemainingLimitActive',
    gameLayerSlotSessionStatistics: 'edict_slot_session_statistics',
    gameLayerRegulationPanelCock: 'edict_regulation_panel_clock'
};

var gaming = {};
gaming.log = {};
gaming.error = {};
gaming.currentGame = {};

//hier liegt, was wir sonst im Portal gefunden haben
var gameFrame = {};
gameFrame.domainSettings = {};
gameFrame.domainSettings.heartbeatConfiguration = {};
gameFrame.domainSettings.heartbeatConfiguration = {heartbeatIntervalInSeconds: 42};

var portalMessages = {};

gameFrame.locale = 'en';
gameFrame.onlyFrontendMessage = false;

gameFrame.audioSettings = {};


var legacy = {};

legacy.loadingNotifications = 0;

legacy.loadingNotifierStop = function(){
    legacy.loadingNotifications--;
       if (legacy.loadingNotifications <= 0) {
           $("#loading_notification").hide();
           legacy.loadingNotifications = 0;
       }
};

$.ajaxSetup({
    dataType: 'json',
    timeout: 30000,
    cache: false
});
/**
 * This class provide the functionality to generate the (casino) service URIs.
 *
 * The concrete path specifications are defined as private constants.
 *
 * Example:
 *
 * Operation: new gameStart.ServiceUri().createPortalSessionUri('merkurmagic');
 * Output: '/services/portal/v1/casinos/merkurmagic/sessions'
 *
 * or:
 *
 * Operation: new gameStart.ServiceUri().createPortalSessionUri('merkurmagic');
 * Output: '/services/portal/v1/casinos/merkurmagic/sessions'
 */
gameStart.ServiceUri = function () {
    /**
     * The base uri used as prefix for URIs generation or an empty string which leads to the generation of absolute URI's.
     */
    var baseUri = '';

    var PORTAL_SESSIONS_PATH = '/services/portal/v1/casinos/{0}/sessions';
    var PORTAL_GAMESTARTPLAYERDTO_PATH = '/services/portal/v1/casinos/{0}/sessions/playerforgamestart/{1}';
    var PORTAL_SESSIONS_AUTH_ENABLE_PATH = '/services/';
    var PORTAL_MESSAGES_RESPONSE_PATH = '/services/portal/v1/casinos/{0}/messages/{1}/response';
    var PORTAL_VALIDATIONS_PATH = '/services/portal/v1/casinos/{0}/validations/{1}';
    var AUTHORIZATION_AUTHORIZE = '/services/authorization/v1/gateway/casinos/{0}/authorize/';
    var GAMELAUNCH_SLOTSESSION = '/services/gamelaunch/v1/gateway/casinos/{0}/launcherData/players/{1}/slotsession/amounts/{2}/time/{3}';
    var GAMELAUNCH_DATA = '/services/gamelaunch/v1/gateway/casinos/{0}/launcherData/players/{1}/{2}/templates/{3}/{4}/{5}';
    var WALLET_TYPE = '/services/gamelaunch/v1/casinos/{0}/walletType';
    var GAMELAUNCH_CASINO = '/services/gamelaunch/v1/casinos/{0}';
    // var GAME_HEARTBEAT_PATH = '/services/gaming/5/{0}/gateway/casinos/{1}/heartbeat?portalLocale={2}';
    var GAME_HEARTBEAT_PATH = '/services/portal/v1/casinos/{0}/heartbeats?portalLocale={1}';

    /**
     * This kind of inner class is responsible to format a string or rather to replace the placeholder of a string.
     *
     * @param format A string contains some optional placeholders in the format {0}, {1}, {2} and so on.
     */
    var Formatter = function (format) {

        this.format = format;

        /**
         * Return the initial given string where the placeholder are replaced by the given arguments, in the same order.
         *
         * @see http://stackoverflow.com/a/4673436
         */
        this.replace = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return this.format.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     */
    this.createPortalSessionsUri = function (casino) {
        return new Formatter(baseUri + PORTAL_SESSIONS_PATH).replace(casino);
    };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     * @param {number} messageId The message ID.
     */
    this.createPortalMessagesResponseUri = function (casino, messageId) {
        return new Formatter(baseUri + PORTAL_MESSAGES_RESPONSE_PATH).replace(casino, messageId);
    };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     * @param {number} playerId The player ID.
     * @param {number} maxLossAmount The max loss amount.
     * @param {number} maxSessionTime The max session time.
     */
    this.createGameLaunchSlotSessionUri = function (casino, playerId, maxLossAmount, maxSessionTime) {
        return new Formatter(baseUri + GAMELAUNCH_SLOTSESSION).replace(casino, playerId, maxLossAmount, maxSessionTime);
    };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     */
    this.createAuthEnableUri = function (casino) {
        return new Formatter(baseUri + PORTAL_SESSIONS_AUTH_ENABLE_PATH).replace(casino);
    };

    this.createWalletTypeUri = function (casino) {
        return new Formatter(baseUri + WALLET_TYPE).replace(casino);
    };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     */
    this.createAuthorizationAuthorizeUri = function (casino) {
        return new Formatter(baseUri + AUTHORIZATION_AUTHORIZE).replace(casino);
    };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     */
    this.createGameLaunchCasinosUri = function (casino) {
        return new Formatter(baseUri + GAMELAUNCH_CASINO).replace(casino);
    };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     * @param {number} playerId The player ID.
     * @param {string} gameKey The game key.
     * @param {string} templateName The template name.
     * @param {string} gameMode The game mode.
     * @param {string} language The language.
     */
    this.createGameLaunchDataUri = function (casino, playerId, gameKey, templateName, gameMode, language) {
        return new Formatter(baseUri + GAMELAUNCH_DATA).replace(casino, playerId, gameKey, templateName, gameMode, language);
    };

    this.createPortalValidationsUri = function (casino, validator) {
         return new Formatter(baseUri + PORTAL_VALIDATIONS_PATH).replace(casino, validator);
     };

    /**
     * @param {string} casino The casino name (e.g. astroroyal).
     * @param {string} playerId The id of requested player.
     */
    this.createGameStartPlayerDtoUri = function (casinoName, playerId) {
        return new Formatter(baseUri + PORTAL_GAMESTARTPLAYERDTO_PATH).replace(casinoName, playerId);
    };
    
    this.createHeartBeatUri = function (casino, locale) {
        return new Formatter(baseUri + GAME_HEARTBEAT_PATH).replace(casino, locale);
    };
};

/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright © edict egaming GmbH, Hamburg (Germany) [2014]
 */
/* -------------------------------------------------------- */
/*                                                          */
/*                      Helper Internal                     */
/*                                                          */
/* -------------------------------------------------------- */
gameFrame.portalRoot = "/";

// This is the worst case - a service error which can't be catched
gameFrame.renderAjaxServiceError = function (httpStatusCode) {
    switch (httpStatusCode) {
        case 401:
        case '401':
            console.log('Service returned 401. Redirect to static error page');

            if(gameFrame.onlyFrontendMessage) {
                gameFrame.closeGame();
            } else {
                window.location.href = "errormessage.html";
            }
            break;
        case 404:
        case '404':
            console.log('Service returned 404. Redirect to static error page');

            if(gameFrame.onlyFrontendMessage) {
                gameFrame.closeGame();
            } else {
               // window.location.href = "errormessage.html";
            }
            break;
        default:
            $.gritter.add({
                title: 'Event',
                text: '<span name="customMessage">service error event</span>',
                sticky: false,
                time: ''
            });
    }
};

legacy.careSystemErrors = function (systemErrorCode) {
    if (systemErrorCode === "102") {
        console.log('System Error 102. Redirect to static error page');
        window.location.href = "errormessage.html";
    }
};

function destroyProgressBar() {
    if ($("#progressbar").progressbar()) {
        $("#progressbar").progressbar("destroy");
    }
    $("#progressbar").html("<div class='progress-label'></div>");
    $("#result").html("");
}

gameFrame.stopProgressBar = function (errorText) {
    destroyProgressBar();
    $("#result").html(errorText);
};

gameFrame.displayAjaxError = function (errorCode, systemErrorCode) {
    // The codes given here were once strings, but are now (sometimes?) given as int. To make sure it always work
    // we cast them to strings
    errorCode = errorCode + "";
    systemErrorCode = systemErrorCode + "";
    switch (errorCode) {
        case "200":
            legacy.careSystemErrors(systemErrorCode);
            break;
        case "302":
            // Do nothing
            break;
        case "400":
            if (systemErrorCode === "5012") {
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Player not found error event</span>',
                    sticky: false,
                    time: ''
                });
            } else if (systemErrorCode === "4011") {
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">clientContextId for validation missing</span>',
                    sticky: false,
                    time: ''
                });
            } else if (systemErrorCode === "6001") {
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">server side input validation failed</span>',
                    sticky: false,
                    time: ''
                });

            } else if (systemErrorCode === "6002") {
                var errorText = '<span name="customMessage"> File size exceeds limit</span>';
                $.gritter.add({
                    title: 'Event',
                    text: errorText,
                    sticky: false,
                    time: ''
                });
                gameFrame.stopProgressBar(errorText);
            } else if (systemErrorCode === "6003") {
                var errorText = '<span name="customMessage">Maximum number of unconfirmed documents reached</span>';
                $.gritter.add({
                    title: 'Event',
                    text: errorText,
                    sticky: false,
                    time: ''
                });
                gameFrame.stopProgressBar(errorText);
            } else {
                // Bad request
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Bad request error event</span>',
                    sticky: false,
                    time: ''
                });
            }
            break;
        case "401":
            // Unauthorized
            $.gritter.add({
                title: 'Event',
                text: '<span name="customMessage">Unauthorized error event</span>',
                sticky: false,
                time: ''
            });
            break;
        case "403":
            if (systemErrorCode === "4010") {
                // Player on block list
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Player blocked event</span>',
                    sticky: false,
                    time: ''
                });
            } else if (systemErrorCode === "102" || systemErrorCode === "1002") {
                // Forbidden
                var errorText = '<span name="customMessage">Forbidden error event - wrong password </span>';
                $.gritter.add({
                    title: 'Event',
                    text: errorText,
                    sticky: false,
                    time: ''
                });
                gameFrame.stopProgressBar(errorText);
            } else {
                // Forbidden
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Forbidden error event</span>',
                    sticky: false,
                    time: ''
                });
            }
            break;
        case "404":
            if (systemErrorCode === "5004") {
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Invalid Email supplied error event</span>',
                    sticky: false,
                    time: ''
                });
            } else {
                // Not found
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Not found error event</span>',
                    sticky: false,
                    time: ''
                });
                console.log('Service returned 404. Redirect to static error page');
                window.location.href = "errormessage.html";
            }
            break;
        case "500":
            if (systemErrorCode === "5005") {
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Invalid secret answer event</span>',
                    sticky: false,
                    time: ''
                });
            } else {
                // Server error
                $.gritter.add({
                    title: 'Event',
                    text: '<span name="customMessage">Server error event</span>',
                    sticky: false,
                    time: ''
                });
            }
            break;
        default:
            // we didn't manage to identify the error
            $.gritter.add({
                title: 'Event',
                text: '<span name="customMessage">service error event: ' + errorCode + '</span>',
                sticky: false,
                time: ''
            });
            break;
    }
};

gameFrame.renderAjaxErrors = function (errorCode, systemErrorCode, url) {
    // The error could not be parsed as a validation error
    // convert the errorCode to a string
    errorCode = errorCode + "";
    systemErrorCode = systemErrorCode + "";
    gameFrame.displayAjaxError(errorCode, systemErrorCode);
};

gameFrame.ajaxErrorHandling = function (jqXHR) {
    legacy.loadingNotifierStop();
    //TODO: soll wirklich ein leerer String hier erstellt werden (wird am Ende gerendert) oder reicht ein undefined
    var errorResponse = '';
    if (jqXHR && jqXHR.responseText && jqXHR.responseText.startsWith('{')) {
        // it seems to be a JSON-response
        errorResponse = JSON.parse(jqXHR.responseText);
    } else {
        if (jqXHR.status === 401) {
            gameStart.invalidateAuthenticationCache();
        }
        gameFrame.renderAjaxServiceError(jqXHR.status);
    }
    if (errorResponse) {
        // Check what error occurred
        // In case of an error, our portal-services answer with a 500-error and include the detailed error in a response-DTO
        // Get the ErrorCode and render the error
        if (errorResponse.errorResponseDTO) {
            var errorCode = errorResponse.errorResponseDTO.returnCode;
            var systemErrorCode = errorResponse.errorResponseDTO.systemErrorCode;
        } else {
            errorCode = errorResponse.returnCode;
            systemErrorCode = errorResponse.systemErrorCode;
        }
        gameFrame.renderAjaxErrors(errorCode, systemErrorCode, this.url);
    }
};

gameStart.browserDetect = (function () {
    var browser;
    var version;
    var OS;

    var init = function () {
        this.browser = this.searchString(this.dataBrowser) || 'An unknown browser';
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'an unknown version';
        this.OS = this.searchString(this.dataOS) || 'an unknown OS';
    };

    var searchVersion = function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    };

    var browserMinimumVersions = [
        {'browser': 'Explorer', 'version': '8'},
        {'browser': 'Firefox', 'version': '4'},
        {'browser': 'Chrome', 'version': '15'},
        {'browser': 'Safari', 'version': '5'},
        {'browser': 'Opera', 'version': '11'}
    ];

    var dataBrowser = [
        {
            string: navigator.userAgent,
            subString: 'Chrome',
            identity: 'Chrome'
        },
        {
            string: navigator.userAgent,
            subString: 'OmniWeb',
            versionSearch: 'OmniWeb/',
            identity: 'OmniWeb'
        },
        {
            string: navigator.vendor,
            subString: 'Apple',
            identity: 'Safari',
            versionSearch: 'Version'
        },
        {
            prop: window.opera,
            identity: 'Opera',
            versionSearch: 'Version'
        },
        {
            string: navigator.vendor,
            subString: 'iCab',
            identity: 'iCab'
        },
        {
            string: navigator.vendor,
            subString: 'KDE',
            identity: 'Konqueror'
        },
        {
            string: navigator.userAgent,
            subString: 'Firefox',
            identity: 'Firefox'
        },
        {
            string: navigator.vendor,
            subString: 'Camino',
            identity: 'Camino'
        },
        {
            // for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: 'Netscape',
            identity: 'Netscape'
        },
        {
            string: navigator.userAgent,
            subString: 'MSIE',
            identity: 'Explorer',
            versionSearch: 'MSIE'
        },
        {
            string: navigator.userAgent,
            subString: 'Gecko',
            identity: 'Explorer',
            versionSearch: 'rv'
        },
        {
            // for older Netscapes (4-)
            string: navigator.userAgent,
            subString: 'Mozilla',
            identity: 'Netscape',
            versionSearch: 'Mozilla'
        }
    ];

    var dataOS = [
        {
            string: navigator.platform,
            subString: 'Win',
            identity: 'Windows'
        },
        {
            string: navigator.platform,
            subString: 'Mac',
            identity: 'Mac'
        },
        {
            string: navigator.userAgent,
            subString: 'iPhone',
            identity: 'iPhone/iPod'
        },
        {
            string: navigator.platform,
            subString: 'Linux',
            identity: 'Linux'
        }
    ];

    var searchString = function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) !== -1) {
                    return data[i].identity;
                }
            } else if (dataProp) {
                return data[i].identity;
            }
        }
    };

    var preflightCheck = function () {
        var statusOK = true;
        // First, check if the browser is on the blacklist
        var browserVersion = parseFloat(this.version);
        var browserDetected = false;

        for (var i = 0; i < browserMinimumVersions.length; i++) {
            if (this.browser === browserMinimumVersions[i].browser) {
                browserDetected = true;
                if (browserVersion < parseFloat(browserMinimumVersions[i].version)) {
                    // Browser is too old
                    // Show message
                    statusOK = false;
                    preFlightCheckMessages('browserOutdated', this.browser, browserMinimumVersions[i].version);
                }
            }
        }
        if (!browserDetected) {
            // if Browser unknown then Show Message
            statusOK = false;
            preFlightCheckMessages('browserUnknown');
        }

        $.cookie('eocCookieCheck', '1', {path: '/'});
        return statusOK;
    };

    var preFlightCheckMessages = function (type, browser, version) {
        var preflightMessage;
        switch (type) {
            case 'browserOutdated':
                preflightMessage = gameFrame.messagesTranslated.PREFLIGHTCHECK_BROWSER_OUTDATED;
                // substitute the parameter
                preflightMessage = preflightMessage.replace('{BROWSER}', browser);
                preflightMessage = preflightMessage.replace('{VERSION}', version);
                if (!$.cookie('preflightCheckMessageDisplayed')) {
                    alert(preflightMessage);
                    $.cookie('preflightCheckMessageDisplayed', 'true');
                }
                break;
            case 'browserUnknown':
                preflightMessage = gameFrame.messagesTranslated.PREFLIGHTCHECK_BROWSER_UNKNOWN;
                if (!$.cookie('preflightCheckMessageDisplayed')) {
                    alert(preflightMessage);
                    $.cookie('preflightCheckMessageDisplayed', 'true');
                }
                break;
            default:
        }
    };

    return {
        init: init,
        searchVersion: searchVersion,
        dataBrowser: dataBrowser,
        dataOS: dataOS,
        searchString: searchString,
        browserMinimumVersions: browserMinimumVersions,
        preflightCheck: preflightCheck,
    }
}());


gameStart.getGameStartGameClientTypes = function () {
    return {
        FLASH: 'FLASH',
        HTML5: 'HTML5'
    };
};

gaming.log.debug = function (message) {
    // just a safety measure for browser that do not have a console
    if (console && typeof console !== 'undefined' && gameStart.debug) {
        console.log(message);
    }
};

gaming.log.exception = function (messageType, exception) {
    if (console && exception) {
        console.trace(exception.message);
        console.log('Stacktrace:\n' + exception.stack);
    }
    gaming.error.navigateToErrorMessage(messageType);
};

gaming.error.navigateToErrorMessage = function (errorCode) {
    // EGB has to show message about 3rd party cookies instead of 1st party cookies
    if (errorCode === 'PREFLIGHTCHECK_COOKIES_DISABLED') {
        errorCode = 'EGB_COOKIES_DISABLED';
    }
    var translatedError = gameFrame.messagesTranslated[errorCode];
    if (typeof translatedError === 'undefined') {
        translatedError = gameFrame.errorsTranslated[errorCode];
    }
    var linkToErrorPage = '/errormessage.html?';
    if (typeof translatedError === 'undefined') {
        linkToErrorPage = linkToErrorPage + 'error=' + errorCode;
    } else {
        linkToErrorPage = linkToErrorPage + 'text=' + translatedError + '&error=' + errorCode;
    }
    linkToErrorPage = linkToErrorPage + '&lang=' + gameFrame.locale;
    gaming.error.setWindowHref(encodeURI(linkToErrorPage));
};

gameStart.getUrlParams = function (k) {
    var p = {};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
        p[k] = v
    });
    return k ? p[k] : p;
};

gameStart.getDomainSettings = function (casino) {
    var domainSettings = {};
    $.ajax({
        url: new gameStart.ServiceUri().createGameLaunchCasinosUri(casino),
        data: '',
        type: 'GET',
        async: false,
        error: gameFrame.ajaxErrorHandling,
        success: function (data) {
            domainSettings = data.domainDTO;
        }
    });
    return domainSettings;
};

gameStart.validateParams = function (params, expectedParams) {
    for (var i = 0; i < expectedParams.length; i++) {
        if (!params.hasOwnProperty(expectedParams[i])) {
            var errorMessage = 'SEVERE: missing parameter [' + expectedParams[i] + '] : expected params to contain properties [' + expectedParams + '],\n but got ' + JSON.stringify(params);
            gaming.log.debug(errorMessage);
            throw errorMessage;
        }
    }
};

gameStart.checkErrorInReponse = function (response) {
    if (response) {
        var error = response.error;
        if (typeof error !== 'undefined') {
            gaming.log.exception(error);
        }
    }
};

gameStart.getMinimumFlashVersion = function () {
    return '11.4.0';
};

gameStart.gameMode = {
    FUN: 'FUN',
    MONEY: 'MONEY'
};

gameStart.updateLanguage = function (newLanguage) {
    var currentLanguage = gameFrame.locale;
    if (newLanguage) {
        // portalLocale cookie is only needed for using correct language when player is not logged in (anymore)
        $.cookie('portalLocale', newLanguage, {path: '/'});
        gameFrame.locale = newLanguage.toLowerCase();
        if (currentLanguage !== gameFrame.locale) {
            gameFrame.translations.loadSystemTextTranslations();
        }
    }
};

gameStart.ETracker = (function () {

    var sendETrackerDataAsynchronous = function (eTrackerCode, gameKey, gameMode) {
        var et_init = function () {
            var et = document.createElement('script');
            $(et).addClass('etracker');
            et.src = document.location.protocol + '//code.etracker.com/a.js?et=' +
                eTrackerCode + '&et_secureId=""&et_gamekey=' + gameKey + '&et_gamemode=' + gameMode;
            var head = document.getElementsByTagName('head')[0];
            head.insertBefore(et, head.firstChild);
        };
        if (window.addEventListener) {
            window.addEventListener('load', et_init, false);
        } else {
            window.attachEvent('onload', et_init);
        }
    };

    return {
        sendETrackerDataAsynchronous: sendETrackerDataAsynchronous,
    };
}());
gameFrame.translations = (function () {
    var translationsPath = 'eoc-translations';
    var translationExtension = '.html';
    var translationPrefix = '/eoc-translations/';
    var translationsObject;

    var convertTranslations = function (translationData) {

        // Fail gracefully if garbage as input
        if (!translationData) {
            return;
        }
        translationsObject = {};

        var lines = translationData.split('\n');
        for (var i = 0; i < lines.length; i++) {
            lines[i] = $.trim(lines[i]);
            if (!lines[i].startsWith('//') && lines[i] !== '') {
                var templateSeparator = lines[i].indexOf('.');
                var template = lines[i].substring(0, templateSeparator);
                var currentLine = lines[i].replace(template + '.', '');
                var firstEqual = currentLine.indexOf('=');
                var key = currentLine.substring(0, firstEqual);
                key = key.replace(/(^\s*)|(\s*$)/gi, '');
                var valuelength = currentLine.length;
                var value = currentLine.substring(firstEqual + 1, valuelength);
                if (value === '' || value === 0) {
                    value = 'MISSING_TRANSLATION';
                }
                if (!translationsObject[template]) {
                    translationsObject[template] = {};
                }
                translationsObject[template][key] = value;
            }
        }
    };

    var readTranslations = function () {
        var url;
        if (!translationsObject) {
            url = translationPrefix + gameFrame.locale + '/' + translationsPath + translationExtension;
        }
        if (url) {
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'text',
                async: false,
                success: function (data) {
                    convertTranslations(data);
                }
            });
        }
    };

    var translateMessageParameter = function (parameterValue) {
        var translatedParameter = gameFrame.messagesTranslated[parameterValue];
        if (typeof translatedParameter === 'undefined') {
            translatedParameter = parameterValue;
        }
        return translatedParameter;
    };

    var loadSystemTextTranslations = function () {
        // read system texts
        if (!translationsObject) {
            readTranslations();
            if(!translationsObject && gameFrame.locale != gameFrame.domainSettings.defaultLanguage){
                gameFrame.locale = gameFrame.domainSettings.defaultLanguage;
                readTranslations();
            }
        }
        gameFrame.systemTexts = translationsObject['system'];
        gameFrame.securityQuestionsTranslated = translationsObject['securityquestions'];
        gameFrame.bookingTypesTranslated = translationsObject['bookingtypes'];
        gameFrame.countriesTranslated = translationsObject['countries'];
        gameFrame.nationalitiesTranslated = translationsObject['nationalities'];
        gameFrame.registrationDataTranslated = translationsObject['registration'];
        gameFrame.errorsTranslated = translationsObject['errors'];
        gameFrame.timezonesTranslated = translationsObject['timezones'];
        gameFrame.messagesTranslated = translationsObject['messages'];
        gameFrame.gamesTranslated = translationsObject['games'];
        gameFrame.gameclienthtml5 = translationsObject['gameclient-html5'];
    };

    var processValueDependingOnParameterType = function (type, value) {
        switch (type) {
            case 'TRANSLATABLE':
                value = translateMessageParameter(value);
                break;
            case 'MONEY':
                var splittedParams = value.toString().split(' ', 2);
                value = gameFrame.convertAmountToCurrency(splittedParams[1], splittedParams[0], true);
                break;
            case 'TRANSLATABLE_LIST':
                var splitted = value.split(',');
                var concatinated = '';
                for (var k = 0; k < splitted.length; k++) {
                    concatinated = concatinated + '<br>- ' + translateMessageParameter(splitted[k]);
                }
                value = concatinated;
                break;
            default:
        }
        return value;
    };


    var translateMessage = function (message) {
        var params = [];
        message.params = message.paramDTOs;
        if (message.paramDTOs) {
            params = message.paramDTOs;
        }

        var uiElements = [];
        if (message.uiElements) {
            for (var i = 0; i < message.uiElements.length; i++) {
                var uiElement = {};
                uiElement.key = message.uiElements[i].elementKey;
                uiElement.translation = gameFrame.messagesTranslated[uiElement.key];
                uiElement.type = message.uiElements[i].elementType;
                uiElements.push(uiElement);
            }
        }

        var messageString = gameFrame.messagesTranslated[message.type];
        if (typeof messageString === 'undefined') {
            messageString = 'Message translation missing for ' + message.type;
        }

        //REVIEW why is eoc.messages being querried again?
        var messageId = message.id;

        // substitute and conditionally translate the parameter
        if (params.length > 0) {
            for (var j = 0; j < params.length; j++) {
                var value = params[j].value;
                value = processValueDependingOnParameterType(params[j].type, value);
                messageString = messageString.replace('{' + params[j].key + '}', value);
            }
        }
        var currentMessage = {};
        currentMessage.uiElements = uiElements;
        currentMessage.messageId = messageId;
        currentMessage.messageString = messageString;
        currentMessage.priority = message.priority;
        currentMessage.messageType = message.type;

        if (message.callbackParams) {
            currentMessage.callbackParams = message.callbackParams;
        }
        return currentMessage;
    };
    return {
        readTranslations: readTranslations,
        translateMessage: translateMessage,
        loadSystemTextTranslations: loadSystemTextTranslations,
    }
})
();

gameStart.activateAuthentication = function (userId, loginToken) {

    if (loginToken) {
        var url = new gameStart.ServiceUri().createAuthEnableUri(gameFrame.casino);
        gaming.log.debug('Ask browser to save credentials globally with positive response');
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", url, false, userId, loginToken);
        xhttp.send('true');
        //Delete temp token to minimize risk of token highjacking
        loginToken = null;
    } else {
        gaming.log.debug('Do not activate token authentication because no token found');
    }
};

gameStart.invalidateAuthenticationCache = function () {
    var url = new gameStart.ServiceUri().createAuthEnableUri(gameFrame.casino);
    var xhttp = new XMLHttpRequest();
    //Force browser to send Authorization header with response of 401
    xhttp.open("POST", url, false, 'usr', 'pwd');
    xhttp.send('false');
};

gameStart.Authorization = (function () {

    var playtechAuthorizationDTO = function (params) {
        return JSON.stringify({
            'AuthorizationDTO': {
                token: params.token,
                game: params.game,
                language: params.language.substring(0, 2),
                clientplatform: params.clientplatform,
                clienttype: params.clienttype,
                currency: params.currency,
                username: params.username
            }
        });
    };

    var whowAuthorizationDTO = function (params) {
        return JSON.stringify({
            'AuthorizationDTO': {
                token: params.token
            }
        });
    };

    var argoAuthorizationDTO = function (params) {
        return JSON.stringify({
            'AuthorizationDTO': {
                token: params.token,
                game: params.game,
                username: params.username,
                language: params.lang.substring(0, 2)
            }
        });
    };

    var getWalletType = function () {
        var walletType = "none";
        $.ajax({
            url: new gameStart.ServiceUri().createWalletTypeUri(gameFrame.casino),
            data: '',
            type: 'GET',
            async: false,
            cache: true,
            error: gameFrame.getAjaxErrorHandler,
            success: function (data) {
                walletType = data.value;
            }
        });
        return walletType;
    };

    var edictAuthorizationDTO = function (params) {
        return JSON.stringify(
            {
                'AuthorizationDTO': {
                    sessionToken: params.sessionToken,
                    playerName: params.playerName,
                    language: params.lang.substring(0, 2),
                    realitySessionTime: params.realitySessionTime,
                    realityElapsedTime: params.realityElapsedTime,
                    realityCheckLinkUrl:
                        typeof params.realityCheckLinkUrl === 'undefined'
                            ? params.realityCheckLinkUrl
                            : decodeURIComponent(params.realityCheckLinkUrl),
                    realityRemainingTime: params.realityRemainingTime,
                    selectedCoin: params.selectedCoin
                }
            }
        );
    };

    var nyxAuthorizationDTO = function (params) {
        return JSON.stringify(
            {
                'AuthorizationDTO': {
                    sessionToken: params.NYXplayerSessionID,
                    language: params.lang.substring(0, 2),
                    realitySessionTime: params.realitySessionTime,
                    realityElapsedTime: params.realityElapsedTime,
                    realityCheckLinkUrl:
                        typeof params.realityCheckLinkUrl === 'undefined'
                            ? params.realityCheckLinkUrl
                            : decodeURIComponent(params.realityCheckLinkUrl),
                    realityRemainingTime: params.realityRemainingTime
                }
            }
        );
    };

    var authorize = function (params) {
        var responseData = {};
        var walletType = getWalletType();
        switch (walletType) {
            case 'EGB_ARGO':
                responseData = argo(params);
                break;
            case 'EGB_EDICT':
                responseData = edict(params);
                break;
            case 'EGB_NYX':
                responseData = nyx(params);
                break;
            case 'EGB_PLAYTECH':
                responseData = playtech(params);
                break;
            case 'EGB_WHOW':
                responseData = whow(params);
                break;
            case 'EOC':
                responseData = tks(params);
                break;
            default:
                console.log("wallet type " + walletType + " not yet implemented");
                break;
        }

        gameStart.checkErrorInReponse(responseData);
        return responseData;
    };

    var tks = function (params) {
        // params.playerName contains playerID!!!
        var gameStartPlayerDto = getGameStartPlayerDto(params.playerName);
        gameFrame.playerLoggedIn = gameStartPlayerDto.isLoggedIn;
        var responseData = {
            language: params.lang.substring(0, 2),
            playerDTO: {id: params.playerName, currencyDisplayInfo: gameStartPlayerDto.currencyDisplayInfo}
        };
        gameFrame.playerData = responseData.playerDTO;
        gameFrame.playerID = params.playerName;
        return responseData;
    };

    var getGameStartPlayerDto = function (playerId) {
        var response = {};
        if (playerId === '') {
            response = {systemErrorCode: 0, returnCode: 200, id: -1, isLoggedIn: false, currencyDisplayInfo: undefined};
        } else {
            $.ajax({
                url: new gameStart.ServiceUri().createGameStartPlayerDtoUri(gameFrame.casino, playerId),
                data: '',
                type: 'GET',
                contentType: 'application/json',
                async: false,
                error: function () {
                    response.error = {};
                    response.error.text = 'no player found for name: ' + playerId;
                },
                success: function (data) {
                    response = data.gameStartPlayerDTO
                }
            });
        }
        return response;
    };

    var edict = function (params) {
        gameStart.validateParams(params, ['playerName', 'sessionToken', 'gameKey', 'casino', 'gameMode', 'lang']);
        return egbRequest(edictAuthorizationDTO(params), params.casino);
    };

    var nyx = function (params) {
        gameStart.validateParams(params, ['NYXplayerSessionID', 'gameid', 'gameMode', 'casino', 'lang']);

        if (params.NYXplayerSessionID) {
            //Session exists, so authorize player
            return egbRequest(nyxAuthorizationDTO(params), params.casino);
        } else if (params.gameMode.toUpperCase() === gameStart.gameMode.MONEY.toUpperCase()) {
            //Money game without valid player session not allowed.
            gaming.log.exception('EGB_GAMELAUNCH_FAILED');
        } else {
            //Prepare dummy response for fun game without logged in player.
            return {language: params.lang};
        }
    };

    var playtech = function (params) {
        gameStart.validateParams(params, ['token', 'real', 'game', 'language', 'backurl', 'casino', 'clientplatform', 'clienttype', 'currency', 'username']);
        var playtechGameMode = gameStart.getPlaytechGameModeFromParam(params.real);

        if (params.token && playtechGameMode === gameStart.gameMode.MONEY.toUpperCase()) {
            //Session exists, so authorize player
            return egbRequest(playtechAuthorizationDTO(params), params.casino);
        } else if (playtechGameMode.toUpperCase() === gameStart.gameMode.MONEY.toUpperCase()) {
            //Money game without valid player session not allowed.
            gaming.log.exception('EGB_GAMELAUNCH_FAILED');
        } else {
            //Prepare dummy response for fun game without logged in player.
            return {language: params.language};
        }
        return {};
    };

    var whow = function (params) {
        gameStart.validateParams(params, ['token', 'casino']);
        if(params.token) {
            return egbRequest(whowAuthorizationDTO(params), params.casino);
        }
        return {};
    };

    var argo = function (params) {
        gameStart.validateParams(params, ['token', 'casino', 'lang']);
        if(params.token) {
            return egbRequest(argoAuthorizationDTO(params), params.casino);
        }
        return {};
    };

    var egbRequest = function (jsonData, casino) {
        var response = {};
        var url = new gameStart.ServiceUri().createAuthorizationAuthorizeUri(casino);
        $.ajax({
            url: url,
            data: jsonData,
            type: 'POST',
            contentType: 'application/json',
            async: false,
            error: function () {
                response.error = {};
                response.error.text = 'EGB_GAMELAUNCH_FAILED';
            },
            success: function (data) {
                if (data['de.edict.eoc.gaming.comm.ResponseDTO']) {
                    response = data['de.edict.eoc.gaming.comm.ResponseDTO'];
                } else {
                    response = data.authorizationResponseDTO;
                    if (typeof (response.playerDTO) === 'undefined') {
                        gameFrame.playerLoggedIn = false;
                        gameFrame.playerID = null;
                    } else {
                        gameFrame.playerLoggedIn = true;
                        gameFrame.playerData = response.playerDTO;
                        gameFrame.playerID = gameFrame.playerData.id;
                        // successful login
                        gameStart.activateAuthentication(gameFrame.playerID, response.sessionToken);
                        //Delete temp token var to minimize risk of token highjacking
                        data.sessionToken = null;
                    }
                }
            }
        });
        return response;
    };

    return {
        authorizePlayer: authorize
    };

}());

gameStart.Resizing = (function (isRegulationPanelActive, isTopBarActive) {
    var topBarActive = isTopBarActive;
    var regulationPanelActive = isRegulationPanelActive;
    var gameWidth = 0;
    var gameHeight = 0;

    window.onresize = function () {
        if (gameFrame.gameClientTypeRunning === gameStart.getGameStartGameClientTypes().FLASH) {
            gameStart.FLASH.resizeGameClientFlash();
            return;
        }
        gaming.log.debug('Layer.js - window.onresize');
        resizeGameLayer(regulationPanelActive, topBarActive);
    };

    var getGameSize = function(){
        return {width:gameWidth,height:gameHeight}
    }

    var sendFullscreenEvents = function () {
        var htmlElement = document.getElementsByTagName('html')[0];
        gaming.log.debug('Layer.js - send fullscreen start event to html element');
        if (htmlElement.requestFullscreen) {
            htmlElement.requestFullscreen();
        } else if (htmlElement.msRequestFullscreen) {
            htmlElement.msRequestFullscreen();
        } else if (htmlElement.mozRequestFullScreen) {
            htmlElement.mozRequestFullScreen();
        } else if (htmlElement.webkitRequestFullscreen) {
            htmlElement.webkitRequestFullscreen();
        }
    };

    var sendFullscreenExitEvents = function () {
        gaming.log.debug('Layer.js - send fullscreen exit event to html element');
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    };

    var resizeGameLayer = function (isRegulationPanelActive, isTopBarActive) {
        topBarActive = isTopBarActive;
        regulationPanelActive = isRegulationPanelActive;

        var gameLayerHTMLContainer = document.getElementById(gameStart.htmlContainerId.edictGameLayer);
        if (!gameLayerHTMLContainer) {
            return;
        }

        var heightRegulationPanel = 0;
        var heightTopBar = 0;

        if (regulationPanelActive) {
            heightRegulationPanel = document.getElementById('edict_regulation_panel').offsetHeight;
        }

        if (topBarActive) {
            heightTopBar = 28;
        }
        var dpr = 1;
        if(window.devicePixelRatio){
            dpr = window.devicePixelRatio;
        }
        gameHeight = window.innerHeight - heightRegulationPanel - heightTopBar;
        gameWidth = window.innerWidth;

        gameLayerHTMLContainer.style.width = gameWidth + "px";
        gameLayerHTMLContainer.style.height = gameHeight + "px";
        gameLayerHTMLContainer.style.marginTop = heightTopBar + "px";

        var iFrame = document.getElementById(gameStart.htmlContainerId.gameLayer);

        if (iFrame) {
            iFrame.style.width = gameWidth + 'px';
            iFrame.style.height = gameHeight + 'px';
        }
        gaming.log.debug('Layer.js - resizeGameLayer : regulationPanelActive:' + regulationPanelActive + ' topBarActive:' + topBarActive + ' width:' + gameWidth + ' height:' + gameHeight);

        if (!gameFrame.externalClientRunning) {
            gaming.log.debug('Layer.js - Inform game client about new size(width X length): ' + gameWidth + 'X' + gameHeight);
            gameFrame.htmlGameCommunicator.sender.notifyClientOnSizeChange(gameWidth, gameHeight);
        }

        if (gameLayerHTMLContainer.offsetTop < 0) {
            gameLayerHTMLContainer.style.top = 0 + 'px';
        }
        deZoom();
    };

    var deZoom = function () {
        $("#edict_game_layer").css('transform', 'scale(1)');
    }

    return {
        resizeGameLayer: resizeGameLayer,
        sendFullscreenExitEvents: sendFullscreenExitEvents,
        sendFullscreenEvents: sendFullscreenEvents,
        getGameSize: getGameSize
    };
}());

gameStart.Layer = (function () {

    var initialGameLayerSize = function () {
        var edictGameLayer = '#' + gameStart.htmlContainerId.edictGameLayer;

        $(edictGameLayer).show();
        $(edictGameLayer).height(window.innerHeight);
        $(edictGameLayer).width(window.innerWidth);
    };

    var launchHTMLGameInIFrame = function (url, gameIframeLoadStep) {
        var edictGameLayer = $('#' + gameStart.htmlContainerId.edictGameLayer);
        var gameIFrame = $(createIFrame(url));
        if (gameIframeLoadStep) {
            $(gameIFrame).load(gameIframeLoadStep);
        }
        $(gameIFrame).show();

        edictGameLayer.append(gameIFrame);
        gameFrame.gameClientRunning = true;
        gameFrame.gameClientTypeRunning = 'HTML5';
        gameStart.Layer.gameStarted();
    };

    var createIFrame = function (url) {
        var gameLayerContainer = $('#' + gameStart.htmlContainerId.edictGameLayer);
        return '<iframe id = "' + gameStart.htmlContainerId.gameLayer
            + '" src="' + url
            + '" name="' + gameStart.htmlContainerId.gameLayer
            + '" frameborder="0" scrolling="no" seamless="seamless" allowtransparency="true" allowfullscreen="true"'
            + '  sandbox="allow-popups allow-same-origin allow-scripts" style="width: ' + gameLayerContainer.width()
            + 'px; height: ' + gameLayerContainer.height() + 'px; left:0; top:0; position: absolute; border:none;overflow:hidden;">' +
            '</iframe>';
    };

    var htmlEncode = function (value) {
        if (typeof value !== 'undefined') {
            return $('<div />').text(value).html();
        } else {
            return '';
        }
    };

    var displayErrorOnErrorPage = function (errorField) {
        var errorHtmlContainer = $(errorField);
        var textField = $(document).getUrlParam('text');
        var error = $(document).getUrlParam('error');
        if (textField) {
            errorHtmlContainer.html('<p>' + htmlEncode(decodeURI(textField)) + '</p>');
        }
        if (error) {
            if (!textField) {
                errorHtmlContainer.html('<p style="display:block">' + htmlEncode(decodeURI(error)) + '</p>');
            }

            errorHtmlContainer.append('<p style="display:none">' + htmlEncode(decodeURI(error)) + '</p>');
        }
    };

    var gameStarted = function () {
        var body = $('body');
        body.css({"overflow": "hidden"});
        body.addClass('stop-scrolling');
    };

    var removeGameLayer = function () {
        var edictGameLayer = $('#' + gameStart.htmlContainerId.edictGameLayer);
        edictGameLayer.hide();
        var iFrame = $('#' + gameStart.htmlContainerId.gameLayer);
        iFrame.remove();
        // var edictGameLayer = '#' + gameStart.htmlContainerId.edictGameLayer;
        // $(edictGameLayer).empty();
    };

    return {
        initialize: initialGameLayerSize,
        launchHTMLGameInIFrame: launchHTMLGameInIFrame,
        displayError: displayErrorOnErrorPage,
        gameStarted: gameStarted,
        removeGameLayer: removeGameLayer,
    };
}());

gameStart.CasinoFreespinsLayer = (function () {
    var casinoFreespinsExists = false;
    var show = function (showFreespinStatusLayer) {
        var freespinStatusLayer = $('#freespin_status_container');
        if (showFreespinStatusLayer && casinoFreespinsExists) {
            freespinStatusLayer.show();
        } else {
            freespinStatusLayer.hide();
        }
    };

    var updateGUI = function (casinoFreespinData) {
        // wenn Freespins = null , dann soll der HTML Bereich nicht angezeigt werden
        // ansonsten sollen die drei Werte Freespin Gewinnsumme
        // und verfügbare / noch verfügbare Freespin Anzahl aktualisiert werden
        var freespinStatusLayer = $('#freespin_status_container');
        if (freespinStatusLayer) {
            var freespinTextArea = $("#freespin_text");

            var playedCasinoFreespin = gameFrame.gameclienthtml5['casino_freespins.played_casino_freespins'];
            var totalWin = gameFrame.gameclienthtml5['casino_freespins.total_win'];
            var freespinTextAreaHTMLValue = '<div><p>' + playedCasinoFreespin + '</p></div><div><p>' + totalWin + '</p></div>';
            freespinTextArea.html(freespinTextAreaHTMLValue);

            if (casinoFreespinData !== undefined && casinoFreespinData !== null) {
                var freespinStatus = $("#freespin_status");
                var numberOfFreespin = casinoFreespinData.quantity - casinoFreespinData.freespinsLeft;
                var htmlValue = '<div><p>' + numberOfFreespin + '/' + casinoFreespinData.quantity + '</p></div><div><p>' + casinoFreespinData.freespinWinSum + '</p></div>';
                freespinStatus.html(htmlValue);
                casinoFreespinsExists = true;
            } else {
                casinoFreespinsExists = false;
                show(false);
            }
        }
    };

    return {
        updateGUI: updateGUI,
        showStatusLayer: show
    };
}());
var eoc = eoc || {};
//var eoc.api = eoc.api || {};

gaming.currentGame.generateUUID = function () {
    var HEXADECIMAL = 16;
    var S4 = function () {
        return (Math.floor((1 + Math.random()) * 0x10000)).toString(HEXADECIMAL).substring(1);
    };
    gaming.currentGame.clientUUID = (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    return gaming.currentGame.clientUUID;
};

gameFrame.logoutSuccess = function (type, referrerUrl) {
    //$.cookie('portalUser', '', { path:'/' });
    gameStart.invalidateAuthenticationCache();
    gameFrame.playerLoggedIn = false;
    gameFrame.logoutAction(type, referrerUrl);
};

// TODO: send window cross message an das Portal
gameFrame.logout = function (type, optionalReason, referrerUrl) {
    if (gameFrame.playerLoggedIn) {
        var url = new gameStart.ServiceUri().createPortalSessionsUri(gameFrame.casino);
        if (optionalReason) {
            url = url + '?reason=' + optionalReason;
        }
        $.ajax({
            url: url,
            data: '',
            type: 'DELETE',
            async: false,
            success: function () {
                gameFrame.logoutSuccess(type, referrerUrl);
            },
            error: gameFrame.ajaxErrorHandling
        });
    } else {
        gameFrame.logoutSuccess(type, referrerUrl);
    }
};

gameFrame.showSlotStatisticsMessage = function (stakeAmount, winAmount) {
    var messageSlotSessionEnded = {
        "flags":"1",
        "id": "-26",
        "messageId": "-26",
        "paramDTOs": [
        {
            key: "STAKE_AMOUNT",
            value: stakeAmount,
            type: "3"
        },
        {
            key: "WIN_AMOUNT",
            value: winAmount,
            type: "3"
        }],
        "params": [
            {
                key: "STAKE_AMOUNT",
                value: stakeAmount,
                type: "3"
            },
            {
                key: "WIN_AMOUNT",
                value: winAmount,
                type: "3"
            }],
        "priority": "ULTRA",
        "type": "SLOT_SESSION_ENDED",
        "text": "SLOT_SESSION_ENDED",

        "uiElements": [
            {
                elementKey: "BUTTON_OK_AND_CLOSE",
                elementType: "BUTTON"
            }
        ]
    };

    gameFrame.gameClientRunning = false;
    gameFrame.onlyFrontendMessage = true;
    gaming.inGameMessageCallbackStore.add(messageSlotSessionEnded, gameFrame.closeGame);
    gameFrame.displayMessageOnFront(messageSlotSessionEnded);
}

gameFrame.closeModalDialog = function (referrerUrl) {
    if (gameFrame.gameClientTypeRunning !== "FLASH") {
        gameFrame.gameClientTypeRunning = '';
        var slotSessionStatisticsActive = portalEnv.isSlotSessionActive();

        if (slotSessionStatisticsActive && typeof referrerUrl !== 'undefined') {
            var winAmount = gameFrame.convertAmountToCurrency(XCG.edict.slotSession.winningsSum);
            var stakeAmount = gameFrame.convertAmountToCurrency(XCG.edict.slotSession.stakeSum);
            gameFrame.showSlotStatisticsMessage(stakeAmount, winAmount);
            return;
        } else {
            gameFrame.closeGame();
        }
    }
}

gameFrame.closeGame = function () {
    var redirectUrl = gameFrame.gameStartParameters.referrerUrl;
    gameFrame.gameClientRunning = false;
    gameFrame.activeGameKey = '';

    //iframe
    if (window.self !== window.top) {
        crossWindowMessaging.sendCrossWindowMessageToParent('notifyCloseContainer');
    } else {
        if (redirectUrl) {
            //popup
            if (window.opener && window.opener !== window) {
                window.close();
            }
            //redirect
            else {
                window.document.location.href = redirectUrl;
                return;
            }
        } else {
            window.close();
        }
    }

    gaming.error.navigateToErrorMessage("EGB_GAMELAUNCH_GAMECLIENT_CLOSED");
}

gameFrame.reloadGameClient = function (){

    $.ajax({
        url: portalEnv.getSessionAliveUrl(),
        async: false,
        error: function (jqXHR, textStatus, errorThrown) {
            XCG.edict7.portalInformation = portalEnv;
            XCG.debug.log('WARNING:' +textStatus + ': ' + jqXHR.status + errorThrown);
            gameStart.connectionErrors.handleErrors(jqXHR);
        },
        success: function () {
            gameStart.Layer.removeGameLayer();
            gaming.portalEnvInitialized = false;
            // game client reload needs to reuse the existing clientUUID otherwise a new game session
            // will be created on server side losing eventually existing slot session settings.
            gameFrame.gameStartParameters.clientUUID = portalEnv.getClientUUID();
            gameStart.Gamestart.startGame(gameFrame.gameStartParameters);
        },
        timeout: 300
    });
};

gameFrame.getCurrencyDisplayInfo = function () {
    var currencyDisplayInfo = {};
    if (gameFrame.playerData && gameFrame.playerData.currencyDisplayInfo) {
        currencyDisplayInfo = gameFrame.playerData.currencyDisplayInfo;
    } else {
        currencyDisplayInfo = gameFrame.domainSettings.currencyDisplayInfo;
    }
    return currencyDisplayInfo;
};

gameFrame.logoutAction = function (type, referrerUrl) {
    gameFrame.closeModalDialog(referrerUrl);
};

gaming.error.setWindowHref = function (href) {
    window.document.location.href = href;
};

gameFrame.getGameStartGameClientTypes = function () {
    return {
        FLASH: 'FLASH',
        HTML5: 'HTML5'
    };
};

gameFrame.getGameChannels = function () {
    //Have to match de.edict.eoc.client.GameChannel
    return {
        DESKTOP: 'DESKTOP',
        MOBILE: 'MOBILE',
        TERMINAL: 'TERMINAL',
        APP: 'APP',
        UNKNOWN: 'UNKNOWN'
    };
};

gameFrame.getAudioSettingConfigOptions = function () {
    return {
        DEFAULT: 'DEFAULT',
        ENABLED: 'ENABLED',
        DISABLED: 'DISABLED'
    };
};

gameFrame.convertAmountToCurrency = function (amount, currency, decimalSeperated) {
    if (typeof decimalSeperated === 'undefined') {
        decimalSeperated = false;
    }
    var decimalPoint = gameFrame.getCurrencyDisplayInfo().decimalSeparator;
    var thousandsSeparator = gameFrame.getCurrencyDisplayInfo().groupSeparator;
    var valueStr = amount.toString().replace(thousandsSeparator, '');
    if (decimalSeperated) {
        valueStr = valueStr.replace(decimalPoint, '');
    }
    var value = (Math.round(valueStr) / 100).toString();
    var currencySymbol = gameFrame.getCurrencyDisplayInfo().currencySymbol;
    //formatting is done with the accounting.js framework.
    //'%v%s' means: value first, then symbol
    var prefixed = '%v %s';
    var precision = gameFrame.getCurrencyDisplayInfo().fractionDigits;
    if (gameFrame.getCurrencyDisplayInfo().printedBefore === true) {
        prefixed = '%s %v';
    }
    var formattedValue = accounting.formatMoney(value, currencySymbol, precision, thousandsSeparator, decimalPoint, prefixed);
    return formattedValue;
};

gameFrame.formatAmountForDisplay = function (amountInCents) {
    if (amountInCents && amountInCents !== 'error' && amountInCents.length > 0) {
        return amountInCents.substring(0, amountInCents.length - 2) + gameFrame.getCurrencyDisplayInfo().decimalSeparator + amountInCents.substring(amountInCents.length - 2);
    } else {
        return '';
    }
};

gameFrame.convertAmountInCents = function (amount) {
    var comma = gameFrame.getCurrencyDisplayInfo().decimalSeparator;
    var point = gameFrame.getCurrencyDisplayInfo().groupSeparator;
    if (!amount) {
        amount = 'error';
    } else if (amount.indexOf(point) > -1) {
        amount = 'error';
    } else if (amount.indexOf(comma) === -1) {
        amount += '00';
    } else if (amount.length - amount.indexOf(comma) === 3) {
        amount = amount.replace(comma, '');
    } else {
        amount = 'error';
    }
    return amount;
};

gameFrame.decodeEntities = (function () {
    //Returning an inner function prevents any overhead from creating the div object each time
    var element = document.createElement('div');

    function decodeHTMLEntities(str) {
        if (str && typeof str === 'string' && /\S/.test(str)) {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^''>]|'[^']*'|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    return decodeHTMLEntities;
})();

gameFrame.linkToResponsibleGaming = function () {
    //Only called on gameClient timeout (see : JavaScriptCallArgs.as)
    window.open("http://www.spielen-mit-verantwortung.de/gluecksspielsucht.html", "responsibleGaming");
};
var portalMessages = (function () {
    var showMessageCallbackPortal;

    var setMessagesCallback = function (callbackFn) {
        showMessageCallbackPortal = callbackFn;
    };

    var callShowMessageCallbackPortal = function (msgForDisplay, deleteMessageCallback) {
        if (typeof deleteMessageCallback === 'undefined') {
            showMessageCallbackPortal(msgForDisplay);
        } else {
            showMessageCallbackPortal(msgForDisplay, deleteMessageCallback);
        }
    };
    return {
        callShowMessageCallbackPortal: callShowMessageCallbackPortal,
        setMessagesCallback: setMessagesCallback
    };
})();


gameFrame.messageRenderQueue = [];

gameFrame.displayMessageOnFront = function (currentMessage) {
    // Translate text and replace params and stuff.
    var msgForDisplay = gameFrame.translations.translateMessage(currentMessage);
    portalMessages.callShowMessageCallbackPortal(msgForDisplay);
};

gameFrame.displayGrowlMessageByTheWay = function (currentMessage) {
    var convertGameClientMessageToPortalMessage = function (msg) {
        // add PortalMessageDTO properties to GameClientMessageDTO
        msg.id = msg.messageId;
        // text property contains message type in GC messageDTO!
        msg.type = msg.text;

        if (!msg.params) {
            msg.params = [];
        }
        msg.params.forEach(function (param) {
            param.value = param.stringVal;
        });
        //convert *special* params to ui elements
        msg.uiElements = [];
        msg.params.forEach(function (param) {
            if (param.key === 'UI_ELEMENT') {
                var button = {};
                button.elementKey = param.value;
                button.elementType = 'BUTTON';
                msg.uiElements.push(button);
            }
            param.value = param.stringVal;
        });

        //add default behaviour for old messageTypes without ui elements
        if (msg.uiElements.length == 0) {
            var btn = {};
            if (msg.flags === 1) {
                btn.elementKey = 'BUTTON_OK_AND_CLOSE';
            } else {
                btn.elementKey = 'BUTTON_OK';
            }
            btn.elementType = 'BUTTON';
            msg.uiElements = [];
            msg.uiElements.push(btn);
        }

        msg.paramDTOs = msg.params;
    };

    // Translate text and replace params and stuff.
    convertGameClientMessageToPortalMessage(currentMessage);
    var msgForDisplay = gameFrame.translations.translateMessage(currentMessage);

    gameFrame.messageRenderQueueGrowlIndexes = [];
    var gritterMessage = {};
    gritterMessage.title = gameFrame.messagesTranslated["MESSAGE_TITLE_NOTIFICATION"];
    gritterMessage.text = "<span id='messageType' name='" + msgForDisplay.messageType + "'>" + msgForDisplay.messageString + "</span>";
    if (currentMessage.priority === 'HIGH') {
        // HIGH prio messages need to be clicked away
        gritterMessage.sticky = true;
    } else {
        gritterMessage.sticky = false;
    }
    gritterMessage.time = '';
    gameFrame.messageRenderQueueGrowlIndexes.push(0);
    //Display the growl
    $.gritter.add(gritterMessage);
    if (currentMessage.messageId) {
        var currentId = currentMessage.messageId;
        var responseData = {};
        responseData["type"] = msgForDisplay.messageType;
        responseData = JSON.stringify(responseData);
        gameFrame.growlMessageCallback(currentId, responseData);
    }
};

gameFrame.defineMessageButtons = function (uiElements) {
    var buttons = {};

    if (uiElements) {
        for (var i = 0; i < uiElements.length; i++) {
            var uiElement = uiElements[i];
            if (uiElement.type === 'BUTTON') {
                buttons[uiElement.translation] = uiElement.key;
            }
        }
    }

    if (jQuery.isEmptyObject(buttons)) {
        buttons[gameFrame.messagesTranslated['BUTTON_OK']] = "BUTTON_OK";
    }
    return buttons;
};

gameFrame.messageCallback = function (messageId, responseData) {
    if (gameFrame.playerLoggedIn && messageId !== '-1' && !gameFrame.onlyFrontendMessage) {
        $.ajax({
            url: new gameStart.ServiceUri().createPortalMessagesResponseUri(gameFrame.casino, messageId),
            data: responseData,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            async: false,
            error: gameFrame.ajaxErrorHandling,
            success: function () {
                gaming.inGameMessageCallbackStore.execute(messageId, responseData);
            }
        });
    } else {
        gaming.inGameMessageCallbackStore.execute(messageId, null);
    }
};

gameFrame.growlMessageCallback = function (messageId, responseData) {
    if (gameFrame.playerLoggedIn && messageId > 0) {
        $.ajax({
            url: new gameStart.ServiceUri().createPortalMessagesResponseUri(gameFrame.casino, messageId),
            data: responseData,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            async: false,
            error: gameFrame.ajaxErrorHandling,
            // success: true
        });
    }
};

gameFrame.messageButtonCallback = function (e, v, m, f) {
//function(event[, value, message, formVals]){}
// Last three parameters available only when button was clicked.
    $.prompt.close();
    var messageId = f.messageId;
    var messageType = f.messageType;

    if (typeof messageType !== 'undefined' && typeof v !== 'undefined') {

        var responseData = {};
        responseData["type"] = messageType;
        var entry = {};
        entry["key"] = v;
        entry["value"] = true;
        var uiElements = {};
        uiElements["entry"] = entry;
        responseData["uiElements"] = uiElements;
        var root = {};
        root['messageResponse'] = responseData;
        root = JSON.stringify(root);

        gameFrame.removeMessageFromRenderQueue(0);
        gameFrame.messageCallback(messageId, root);

        switch (messageType) {
            case 'SLOT_WARN':
                if (v === "BUTTON_CANCEL") {
                    window.close();
                } else if (v === "BUTTON_OK") {
                    gameStart.Gamestart.startGame(f);
                }
                break;
            case 'FREESPINS_FINISHED_WIN':
            case 'FREESPINS_FINISHED_NO_WIN':
            case 'FREESPINS_CANCELLATION_EXPIRED':
            case 'FREESPINS_CANCELLATION_CANCELED':
                location.reload();
                break;
        }
    }
    return false;
};

gameFrame.renderNextMessage = function () {

    // TODO remove function if built-in-coneJS-games are no longer on live systems
    function handleGrowlMessages() {
        gameFrame.messageRenderQueueGrowlIndexes = [];
        // for (var i = 0; i < gameFrame.messageRenderQueue.length; i++) {
        // configuration which messages are shown as growls
        var i = 0;
        // if (!(gameFrame.messageRenderQueue[i].priority !== 'HIGHEST' && gameFrame.messageRenderQueue[i].priority !== 'ULTRA')) {
        //     return;
        // }
        var gritterMessage = {};
        gritterMessage.title = gameFrame.messagesTranslated["MESSAGE_TITLE_NOTIFICATION"];
        gritterMessage.text = "<span id='messageType' name='" + gameFrame.messageRenderQueue[0].messageType + "'>" + gameFrame.messageRenderQueue[0].messageString + "</span>";
        if (gameFrame.messageRenderQueue[0].priority === 'HIGH') {
            // HIGH prio messages need to be clicked away
            gritterMessage.sticky = true;
        } else {
            gritterMessage.sticky = false;
        }
        gritterMessage.time = '';
        //Add custom callbacks
        gritterMessage = gameFrame.addGrowlMessageCallbacks(gritterMessage, gameFrame.messageRenderQueue[0].messageType);
        gameFrame.messageRenderQueueGrowlIndexes.push(0);
        //Display the growl
        $.gritter.add(gritterMessage);
        //Remove the growl messages from queue
        if (gameFrame.messageRenderQueue[0].messageId) {
            var currentId = gameFrame.messageRenderQueue[0].messageId;
            var responseData = {};
            responseData["type"] = gameFrame.messageRenderQueue[0].messageType;
            responseData = JSON.stringify(responseData);
            gameFrame.removeMessageFromRenderQueue(i);
            gameFrame.messageCallback(currentId, responseData);
        } else {
            console.log('Error: message without message-id');
        }
        // }
    }

    function handleModalMessages() {
        var isMessageShowing = jQuery.prompt.getCurrentState();

        if (typeof isMessageShowing === 'undefined') {
            // Now get the first non growl message from queue
            try {

                var currentMessage = gameFrame.messageRenderQueue[0];

                if (typeof currentMessage.messageType === 'undefined') {
                    currentMessage.messageType = '';
                }

                // Configuration of dialog style messages
                // Set the message options and buttons
                var messageOptions = {};
                messageOptions.submit = gameFrame.messageButtonCallback;
                messageOptions.buttons = gameFrame.defineMessageButtons(currentMessage.uiElements);
                messageOptions.loaded = function () {
                    $(".jqiclose").css("display", "none");
                };
                var messageStringWithParams = "<span name='" + currentMessage.messageType + "'>" + currentMessage.messageString + "</span>";
                messageStringWithParams = messageStringWithParams +
                    "<input type='hidden' name='messageId' value='" + currentMessage.messageId + "'>" +
                    "<input type='hidden' name='messageType' value='" + currentMessage.messageType + "'>";
                if (currentMessage.callbackParams) {
                    for (var propertyName in currentMessage.callbackParams) {
                        if (currentMessage.callbackParams.hasOwnProperty(propertyName)) {
                            messageStringWithParams = messageStringWithParams +
                                "<input type='hidden' name='" + propertyName + "' value='" + currentMessage.callbackParams[propertyName] + "'>"
                        }
                    }
                }

                $.prompt(messageStringWithParams, messageOptions);
                //now bring message to front:
                $(".jqibox").css("z-index", "10000002");

            } catch (err) {
                // Intentionally left blank
                // console.log('Caught error in message display try block: ' + err); // for debugging
            }
        }
    }

    if (gameFrame.messageRenderQueue.length === 0) {
        return;
    }
    if (gameFrame.messageRenderQueue[0].priority === 'HIGHEST' || gameFrame.messageRenderQueue[0].priority === 'ULTRA') {
        handleModalMessages();
    } else {
        handleGrowlMessages();
    }
};

gameFrame.removeMessageFromRenderQueue = function (indexToRemove) {
    gameFrame.messageRenderQueue.splice(indexToRemove, 1);
    if (gameFrame.messageRenderQueue.length > 0) {
        gaming.log.debug('found still some pending messages in queue, trigger renderNextMessage method again');
        gaming.log.debug(gameFrame.messageRenderQueue);
    }
};

gameFrame.addGrowlMessageCallbacks = function (growlMessage, messageType) {
    return growlMessage;
};

function showInGameMessage(message) {
    if (message) {
        gameFrame.queueMessageForRendering(message.messageId, message.messageString, message.priority, message.messageType, message.uiElements, message.callbackParams);
        gameFrame.renderNextMessage();
    }
}

gameFrame.showInGameMessageCallback = function (message) {
    // Connect method to show in game messages (HTML5 Games)
    console.log("Entered gameFrame.showInGameMessageCallback");
    showInGameMessage(message);
};

gameFrame.queueMessageForRendering = function (messageId, messageString, priority, messageType, uiElements, params) {
    // Prevent double messages in queue
    var messageAlreadyInQueue = false;
    for (var i = 0; i < gameFrame.messageRenderQueue.length; i++) {
        if (gameFrame.messageRenderQueue[i].messageId !== null
            && Number(gameFrame.messageRenderQueue[i].messageId) === Number(messageId)) {
            messageAlreadyInQueue = true;
        }
    }
    if (!messageAlreadyInQueue) {
        var currentMessage = {};
        currentMessage.uiElements = uiElements;
        currentMessage.messageId = messageId;
        currentMessage.messageString = messageString;
        currentMessage.priority = priority;
        currentMessage.messageType = messageType;
        if (params) {
            currentMessage.callbackParams = params;
        }
        gameFrame.messageRenderQueue.push(currentMessage);
    }
};

gaming.inGameMessageCallbackStore = function () {
    var allReadClbckArray = []; // deprecated
    var allReadCallback;
    var messageCallbackMap = {};
    var messageMap = {};

    function getMapSize() {
        var size = 0, key;
        for (key in messageMap) {
            if (messageMap.hasOwnProperty(key)) {
                size++;
            }
        }
        return size;
    }

    return {
        setAllMessagesReadCallback: function (allMessagesReadCallback) {
            allReadCallback = allMessagesReadCallback;
        },
        add: function (message, messageReadCallback) {
            messageMap[message.id] = message;
            messageCallbackMap[message.id] = messageReadCallback;
        },
        clear: function () {  // for testing usage only
            messageCallbackMap = {};
            messageMap = {};
        },
        execute: function (messageId, responseData) {
            if (messageId in messageCallbackMap) {
                if (messageCallbackMap[messageId]) {
                    gaming.log.debug('executing callback for message ' + messageId);
                    //execute messageReadCallback
                    messageCallbackMap[messageId](messageId);
                    if (responseData && responseData.includes('AND_CLOSE')) {
                        gameFrame.closeModalDialog();
                    }
                }
                // delete messageCallbackMap[messageId];
                delete messageMap[messageId];
                if (getMapSize() === 0) {
                    allReadCallback();
                } else {
                    try {
                        var currentMessage = messageMap[Object.keys(messageMap)[0]];
                        gameFrame.displayMessageOnFront(currentMessage);
                    } catch (exception) {
                        allReadCallback();
                    }
                }
            } else {
                gaming.log.debug('provided message id is unknown for inGame-Message-Store');
            }
        }
    };
}();

var eoc = eoc || {};
eoc.custom = eoc.custom || {};

eoc.logout = function (type) {
    //Only called on gameClient timeout (see : JavaScriptCallArgs.as)
    return gameFrame.logout(type, 'timeout');
};

var closeModalDialog = function(){
    //Only called on gameClient timeout (see : JavaScriptCallArgs.as)
    return gameFrame.closeModalDialog();
};

// This Method needs the parameter for compatibility with existing flash clients
eoc.showGameHelp = function(gameKey){
    var url = window.location.protocol + "//" + window.location.host + "/eoc-flashhelp.html#gameKey=" + gameFrame.gameStartParameters.gameKey + "&language=" + gameFrame.gameStartParameters.language;
    var options = "width=955,height=730, resizable=no,titlebar=0,status=0,menubar=1,location=0,toolbar=0,scrollbars=1";
    var helpWindow = window.open(url, "_blank", options);
    helpWindow.focus();
};

var messageLink = function(targetsArray){
    //Only called on gameClient timeout (see : JavaScriptCallArgs.as)
    var func;
    func = targetsArray[0];
    window[func]();
};

eoc.custom.linkToResponsibleGaming = function(){
    //Only called on gameClient timeout (see : JavaScriptCallArgs.as)
    gameFrame.linkToResponsibleGaming();
};

gameStart.FLASH = (function () {
    var getGameClientSizeWithFixAspectRatio = function () {
        var gameAspectRatio = 1.45;
        var windowAspectRatio = window.innerWidth / window.innerHeight;

        function getGameHeight() {
            var gameHeight;
            if (windowAspectRatio >= gameAspectRatio) {
                gameHeight = window.innerHeight;
                var maxGameClientHeight = 1400;
                gameHeight = (gameHeight > maxGameClientHeight) ? maxGameClientHeight : gameHeight;
            } else {
                return getGameWidth() / gameAspectRatio;
            }
            return gameHeight;
        }

        function getGameWidth() {
            var gameWidth;
            if (windowAspectRatio >= gameAspectRatio) {
                gameWidth = getGameHeight() * gameAspectRatio;
            } else {
                gameWidth = window.innerWidth;
                var maxGameClientWidth = 2030;
                gameWidth = (gameWidth > maxGameClientWidth) ? maxGameClientWidth : gameWidth;
            }
            return gameWidth;
        }

        return {
            height: getGameHeight(),
            width: getGameWidth()
        };
    };

    var resizeGameClientFlash = function () {
        var gameHeight = getGameClientSizeWithFixAspectRatio().height;
        var gameWidth = Math.floor(getGameClientSizeWithFixAspectRatio().width);

        $('#' + gameStart.htmlContainerId.edictGameLayer).css({'height': gameHeight, 'width': gameWidth});
        $('#' + gameStart.htmlContainerId.gameLayer).attr({'height': gameHeight, 'width': gameWidth});
        setCentralModalDialogPosition('#' + gameStart.htmlContainerId.edictGameLayer);
    };

    function setCentralModalDialogPosition(gameLayer) {
        var windowHeight = window.innerHeight;
        var cIdOuterHeight = $(gameLayer).outerHeight(true);
        var windowWidth = window.innerWidth;
        var cIdOuterWidth = $(gameLayer).outerWidth(true);
        var hc = (windowHeight / 2) - (cIdOuterHeight / 2);
        var vc = (windowWidth / 2) - (cIdOuterWidth / 2);
        $(gameLayer).css({left: vc, top: hc});
    }

    var launchGame = function (gameStartParameters) {
        var dummySlotSessionResponse = {
            showSlotSessionInClient: false
        };
        var failureCallback = function (object) {
            if (object.success === false) {
                gaming.error.navigateToErrorMessage('EGB_GAMELAUNCH_FAILED');
            }
        };

        var htmlContainer = $('#' + gameStart.htmlContainerId.edictGameLayer);
        var gameLayer = $('<div id="' + gameStart.htmlContainerId.gameLayer + '"></div>');
        htmlContainer.append(gameLayer);
        htmlContainer.show();
        $('body').addClass('stop-scrolling');

        gameFrame.gameClientRunning = true;
        gameFrame.externalClientRunning = false;
        embedSWF(gameStartParameters, failureCallback, dummySlotSessionResponse);

        resizeGameClientFlash();

        $("body").css({"overflow": "hidden"});
    };

    var embedSWF = function (gameStartParameters, failureCallBack, slotSessionResponse) {
        var gameClientsV1Url = '/gameclient';
        var swfFileName = gameStartParameters.fileName;
        var restUrlPattern = gameStartParameters.restUrlPattern;
        var pathGameClients = (gameStartParameters.launcherType === 'overCore') ? gameClientsV1Url : '';

        var params = {
            allowFullScreen: 'true',
            allowscriptaccess: 'always',
            wmode: 'direct'
        };
        var attributes = {};

        function getFlashVarParams() {
            var flashvars = {};

            function setGameClientConfigFromLaunchData() {
                var configs = {};
                var coreConfig;
                var gameConfig;

                function flattenTheTree(parent, index) {
                    if (index === parent.length) {
                        return parent;
                    }
                    if (parent[index].children) {
                        for (var i = 0; i < parent[index].children.length; i++) {
                            parent[parent.length] = parent[index].children[i];
                        }
                    }
                    return flattenTheTree(parent, index + 1);
                }

                function extractKeyValuePairs(optionList) {
                    var keyValuePairs = {};
                    for (var i = 0; i < optionList.length; i++) {
                        var param = optionList[i];
                        keyValuePairs[param.name] = param.optionValue;
                    }
                    return keyValuePairs;
                }

                if (gameStartParameters.gameClientConfiguration) {
                    var config = gameStartParameters.gameClientConfiguration.children;
                    for (var i = 0; i < config.length; i++) {
                        if (config[i].name === 'CORE') {
                            coreConfig = flattenTheTree(config[i].children, 0);
                            configs.coreConfig = extractKeyValuePairs(coreConfig);
                        } else if (config[i].name === 'GAME') {
                            gameConfig = flattenTheTree(config[i].children, 0);
                            configs.gameConfig = extractKeyValuePairs(gameConfig);
                        }
                    }
                    flashvars.clientConfiguration = encodeURIComponent(JSON.stringify(configs));
                }
            }

            function setFlashVarsForCoreVersion2() {
                flashvars.currencySymbol = gameFrame.decodeEntities(clientCurrency);
                flashvars.decimalPoint = gameFrame.getCurrencyDisplayInfo().decimalSeparator;
                flashvars.thousandsSeparator = gameFrame.getCurrencyDisplayInfo().groupSeparator;
                flashvars.currencyPrefix = gameFrame.getCurrencyDisplayInfo().printedBefore;
                flashvars.decimalSeparator = gameFrame.getCurrencyDisplayInfo().decimalSeparator;
                flashvars.fractionDigits = gameFrame.getCurrencyDisplayInfo().fractionDigits;
                flashvars.groupSeparator = gameFrame.getCurrencyDisplayInfo().groupSeparator;
                flashvars.printedBefore = gameFrame.getCurrencyDisplayInfo().printedBefore;
            }

            function setFlashVarsForCoreVersion3() {
                var currencyDisplayInfo = gameFrame.getCurrencyDisplayInfo();
                currencyDisplayInfo.currencySymbol = (gameModeUpper === gameStart.gameMode.MONEY) ? currencyDisplayInfo.currencySymbol : '';
                flashvars.currencyDisplayInfo = encodeURIComponent(JSON.stringify(currencyDisplayInfo));
            }

            var gameModeUpper = gameStartParameters.gameMode.toUpperCase();
            var clientCurrency = (gameModeUpper === gameStart.gameMode.MONEY) ? gameFrame.getCurrencyDisplayInfo().currencySymbol : '';
            flashvars.bgColor = '#000000';
            flashvars.allowFullScreen = 'true';
            flashvars.sessionID = 'default';
            flashvars.game = gameStartParameters.legacyGameName;
            flashvars.templateId = gameStartParameters.templateId;
            flashvars.gameLocaleKey = gameStartParameters.casinoGameTemplateName;
            flashvars.gameserver = window.location.protocol + '//' + window.location.host + gameStartParameters.servicesGamingUrl;
            flashvars.messageTranslations = window.location.protocol + '//' + window.location.host + '/eoc-translations/' + gameFrame.locale + '/eoc-translations/messages.html';
            flashvars.messageTranslationsURL = window.location.protocol + '//' + window.location.host + '/eoc-translations/' + gameFrame.locale + '/eoc-translations.html';
            flashvars.sessionTimeoutUrl = '#{' + gameStart.htmlContainerId.gameLayer + '.sessionTimeoutUrl}';
            flashvars.errorUrl = '#{' + gameStart.htmlContainerId.gameLayer + '.errorUrl}';
            flashvars.rpcTimeoutInSeconds = '60';
            flashvars.portalLocale = gameStartParameters.language;
            flashvars.casinoName = gameStartParameters.casino;
            flashvars.clientUUID = gaming.currentGame.generateUUID();
            flashvars.restUrlPattern = restUrlPattern;
            setFlashVarsForCoreVersion2();
            setFlashVarsForCoreVersion3();
            flashvars.gameMode = gameModeUpper;
            if (!gameFrame.EGBActive) {
                flashvars.heartbeatIntervalInSeconds = gameFrame.domainSettings.heartbeatConfiguration.heartbeatIntervalInSeconds;
            }
            flashvars.showSlotSessionInClient = gameStartParameters.showSlotSessionInClient ? gameStartParameters.showSlotSessionInClient : slotSessionResponse.showSlotSessionInClient;

            setGameClientConfigFromLaunchData();

            return flashvars;
        }

        swfobject.embedSWF('' + pathGameClients + swfFileName, gameStart.htmlContainerId.gameLayer, 1, 1, gameStart.getMinimumFlashVersion(), '', getFlashVarParams(), params, attributes, failureCallBack);
    };

    return {
        launchGame: launchGame,
        resizeGameClientFlash: resizeGameClientFlash
    };
}());
gaming.getHelpContentFromURL = function (contentUri) {
    var helpContent;
    $.ajax({
        url: contentUri,
        dataType: 'html',
        async: false,
        error: function () {
            helpContent = "<h2>Error 404</h2><p>Not found...</p>";
        },
        success: function (html) {
            var badPath = '\\.\\.\\/\\.\\.\\/\\.\\.\\/';
            var replacement = '$1/eoc-content/$3';

            // correct the image path elements
            var imgRegex = new RegExp('(<img[^>]+src=")(' + badPath + ')(.*?")', "g");
            html = html.replace(imgRegex, replacement);

            //correct stylesheet url
            var styleRegex = new RegExp('(<link rel="stylesheet[^>]+href=")(' + badPath + ')(.*?")', "g");
            html = html.replace(styleRegex, replacement);

            //correct js link
            var scriptRegex = new RegExp('(<script src=")(' + badPath + ')(.*?")', "g");
            html = html.replace(scriptRegex, replacement);

            // correct url link elements first
            var linkRegex = new RegExp('(<a[^>]+href=")(' + badPath + ')(.*?")', "g");
            html = html.replace(linkRegex, replacement);

            //then replace them with window.open script
            var hrefRegex = new RegExp('(href=")(.*?pdf)"', "g");
            helpContent = html.replace(hrefRegex, "onclick=\"window.open('$2', '_blank','status=no, scrollbars=yes')\"");
        }
    });
    return helpContent;
};
var portalEnv = portalEnv || {};

gameFrame.htmlGameCommunicator = (function () {
    var actionCommandCallback;
    var gameClientSizeChangedCallback;

    var currentGameKey;
    var currentGameMode;
    var currentGameLauncherData;
    var currentGameClientConfiguration;

    var casino;
    var pathCasino;
    var pathHeartbeat;
    var pathInit;

    var fallbackTranslations = {
        'depot_label': 'Depot',
        'limited_depot_label': 'Limit',
        'decimal_separator': '.',
        'stake_label': 'Stake',
        'winnings_label': 'Winnings'
    };

    var actionCommands = {
        PAUSE: 'pause',
        RESUME: 'resume',
        UPDATEDEPOT: 'updateDepot',
        ENABLEAUDIO: 'enableAudio',
        DISABLEAUDIO: 'disableAudio',
        STARTGAME: 'startGame',
        TOGGLEHELP: 'toggleHelp',
        SHOWHELP: 'showHelp',
        CLOSEHELP: 'closeHelp',
        PAUSEAUTOPLAY: 'pauseAutoPlay',
        RESUMEAUTOPLAY: 'resumeAutoPlay',
        TOGGLEPAYTABLE: 'togglePaytable',
        SHOWPAYTABLE: 'showPaytable',
        CLOSEPAYTABLE: 'closePaytable'
    };

    var sender = (function () {
        var sendActionCommand = function (command, value) {
            if (legacy.postMessageCommunicationWithCoreEnabled) {
                var responseType = 'gameCommand';
                var responseData = command;
                sendCrossWindowMessageToGame(responseType, responseData);
            } else {
                actionCommandCallback(command, value);
            }
        };

        var pauseGame = function () {
            sendActionCommand(actionCommands.PAUSE);
        };

        var resumeGame = function () {
            sendActionCommand(actionCommands.RESUME);
        };

        var enableAudio = function () {
            sendActionCommand(actionCommands.ENABLEAUDIO);
        };

        var disableAudio = function () {
            sendActionCommand(actionCommands.DISABLEAUDIO);
        };

        var updateDepot = function () {
            sendActionCommand(actionCommands.UPDATEDEPOT);
        };

        var updateDepot = function (depotDTO) {
            sendActionCommand(actionCommands.UPDATEDEPOT, depotDTO);
        };

        var toggleHelp = function () {
            sendActionCommand(actionCommands.TOGGLEHELP);
        };

        var showHelp = function () {
            sendActionCommand(actionCommands.SHOWHELP);
        };

        var closeHelp = function () {
            sendActionCommand(actionCommands.CLOSEHELP);
        };

        var togglePaytable = function () {
            sendActionCommand(actionCommands.TOGGLEPAYTABLE);
        };

        var showPaytable = function () {
            sendActionCommand(actionCommands.SHOWPAYTABLE);
        };

        var closePaytable = function () {
            sendActionCommand(actionCommands.CLOSEPAYTABLE);
        };

        var startGame = function () {
            sendActionCommand(actionCommands.STARTGAME);
        };

        var pauseAutoPlayAfterGameRound = function () {
            sendActionCommand(actionCommands.PAUSEAUTOPLAY);
        };

        var resumeAutoPlay = function () {
            sendActionCommand(actionCommands.RESUMEAUTOPLAY);
        };

        var sendCrossWindowMessageToGame = function (responseType, responseData) {
            var commDTO = {
                responseType: responseType,
                responseData: responseData
            };
            var objectAsString = JSON.stringify(commDTO);
            crossWindowMessaging.sendCrossWindowMessageToChildFrame(gameStart.htmlContainerId.gameLayer, objectAsString);
        };

        var notifyClientOnSizeChange = function (x, y) {
            gaming.log.debug('HTMLGameCommunicator.js - Send game client new sizes (width X height): ' + x + 'X' + y);
            if (legacy.postMessageCommunicationWithCoreEnabled) {
                var responseType = 'sizeChanged';
                var responseData = {
                    width: x,
                    height: y
                };
                gaming.log.debug('HTMLGameCommunicator.js - Send cross window message to game client for new sizes');
                sendCrossWindowMessageToGame(responseType, responseData);
            } else {
                gaming.log.debug('HTMLGameCommunicator.js - call gameClientSizeChangedCallback for new sizes');
                if (isGameClientSizeChangedCallbackDefined()) {
                    gameClientSizeChangedCallback(x, y);
                } else {
                    gaming.log.debug('HTMLGameCommunicator.js - gameClientSizeChangedCallback is undefined');
                }

            }
        };

        var createAndSendPortalInformation = function () {
            var responseType = 'portalInformation';
            var response = {
                gameRootUrl: portalEnv.getGameRootUrl(),
                variant: portalEnv.getVariant(),
                locale: portalEnv.getLocale(),
                gameTimeoutSeconds: portalEnv.getGameTimeoutSeconds(),
                initUrl: portalEnv.getInitUrl(),
                heartbeatUrl: portalEnv.getHeartbeatUrl(),
                startUrl: portalEnv.getStartUrl(),
                closeUrl: portalEnv.getCloseUrl(),
                balanceUrl: portalEnv.getBalanceUrl(),
                onCommandUrl: portalEnv.getOnCommandUrl(),
                translations: portalEnv.getTranslations(),
                clientUUID: portalEnv.getClientUUID(),
                currency: portalEnv.getCurrency(),
                jurisdiction: portalEnv.getJurisdiction(),
                responsibleGamingActive: portalEnv.isResponsibleGamingActive(),
                responsibleGamingIconPath: portalEnv.getResponsibleGamingIconPath(),
                heartbeatInterval: portalEnv.getHeartbeatInterval(),
                casinoOptions: getCasinoOptions(),
                requiredCookies: getRequiredCookies()
            };
            if (!gaming.portalEnvInitialized) {
                gaming.portalEnvInitialized = true;
                sendCrossWindowMessageToGame(responseType, response);
            }
        };

        var createAndSendHelpContent = function () {
            var helpContentObject = portalEnv.getHelpContent();
            var responseType = 'helpContent';
            sendCrossWindowMessageToGame(responseType, helpContentObject);
        };

        var publicSenderFunctions = {
            pauseGame: pauseGame,
            resumeGame: resumeGame,
            enableAudio: enableAudio,
            disableAudio: disableAudio,
            updateDepot: updateDepot,
            toggleHelp: toggleHelp,
            showHelp: showHelp,
            closeHelp: closeHelp,
            togglePaytable: togglePaytable,
            showPaytable: showPaytable,
            closePaytable: closePaytable,
            startGame: startGame,
            pauseAutoPlayAfterGameRound: pauseAutoPlayAfterGameRound,
            resumeAutoPlay: resumeAutoPlay,
            notifyClientOnSizeChange: notifyClientOnSizeChange,
            createAndSendPortalInformation: createAndSendPortalInformation,
            createAndSendHelpContent: createAndSendHelpContent,
            sendMessageToGame: sendCrossWindowMessageToGame
        };

        return publicSenderFunctions;

    })();

    var isRegulationPanelActive = function () {
        var slotSessionRemainingTimeActive = gameFrame.domainSettings.slotSessionLimitConfigurationDTO.slotSessionRemainingTimeActive;
        var slotSessionRemainingLimitActive = gameFrame.domainSettings.slotSessionLimitConfigurationDTO.slotSessionRemainingLimitActive;
        var slotSessionStatisticsActive = gameFrame.domainSettings.slotSessionStatisticsConfigurationDTO.active;
        var regulationPanelClockActive = gameFrame.domainSettings.regulationPanelClockConfigurationDTO.active;
        var responsibleGamingActive = gameFrame.domainSettings.responsibleGamingLinkConfigurationDTO.active;

        if (slotSessionRemainingTimeActive || slotSessionRemainingLimitActive || slotSessionStatisticsActive ||
            regulationPanelClockActive || responsibleGamingActive) {
            return true;
        } else {
            return false;
        }
    };

    var slotSessionTimerRunning = false;
    var updateSlotSessionGUI = function () {
        var slotSessionRemainingTimeActive = gameFrame.domainSettings.slotSessionLimitConfigurationDTO.slotSessionRemainingTimeActive;
        var slotSessionRemainingLimitActive = gameFrame.domainSettings.slotSessionLimitConfigurationDTO.slotSessionRemainingLimitActive;
        var slotSessionStatisticsActive = gameFrame.domainSettings.slotSessionStatisticsConfigurationDTO.active;
        var regulationPanelClockActive = gameFrame.domainSettings.regulationPanelClockConfigurationDTO.active;
        var responsibleGamingActive = gameFrame.domainSettings.responsibleGamingLinkConfigurationDTO.active;
        var slotSessionRemainingTime = XCG.edict.slotSession.slotSessionRemainingTime;
        var slotSessionRemainingLimit = XCG.edict.slotSession.slotSessionRemainingLimit;
        var winnings = XCG.edict.slotSession.winningsSum;
        var stakes = XCG.edict.slotSession.stakeSum;
        var profit = XCG.edict.slotSession.profit;

        if (slotSessionRemainingTime === undefined) {
            slotSessionRemainingTimeActive = false;
        }

        if (slotSessionRemainingLimit === undefined) {
            slotSessionRemainingLimitActive = false;
        }

        if (winnings === undefined || stakes === undefined || profit === undefined) {
            slotSessionStatisticsActive = false;
        }

        if (slotSessionRemainingTimeActive || slotSessionRemainingLimitActive || slotSessionStatisticsActive ||
            regulationPanelClockActive || responsibleGamingActive) {
            $('#edict_regulation_panel').show();
        }

        if (slotSessionRemainingTimeActive) {
            $('#slotSessionRemainingTimeActive').show();

            if (slotSessionTimerRunning === false) {
                slotSessionTimerRunning = true;
                var inSeconds = slotSessionRemainingTime / 1000;
                var display = document.querySelector('#slotSessionRemainingTime');
                startTimer(inSeconds, display);
            }
        }

        if (slotSessionRemainingLimitActive) {
            $('#slotSessionRemainingLimitActive').show();

            slotSessionRemainingLimit = gameFrame.convertAmountToCurrency(slotSessionRemainingLimit, portalEnv.getCurrency(), true);
            $('#slotSessionRemainingLimit').html(slotSessionRemainingLimit);
        }

        if (slotSessionStatisticsActive) {
            $('#edict_slot_session_statistics').show();
            var winnings = gameFrame.convertAmountToCurrency(winnings, portalEnv.getCurrency(), true);
            var stakes = gameFrame.convertAmountToCurrency(stakes, portalEnv.getCurrency(), true);
            var profit = gameFrame.convertAmountToCurrency(profit, portalEnv.getCurrency(), true);

            var htmlValue = "<div>Ganancias: " + winnings + " Apuestas: " + stakes + " Resultado: " + profit + "</div>";
            $('#edict_slot_session_statistics').html(htmlValue);
        }

        if (regulationPanelClockActive) {
            $('#edict_regulation_panel_clock').show();
            setInterval(clock, 1000);
        }

        if (responsibleGamingActive) {
            $('#edict_responsibleGaming').show();
            showResponsibleGambling();
        }
    };

    function clock() {
        var time = new Date(),
            hours = time.getHours(),
            minutes = time.getMinutes();

        document.querySelectorAll('#edict_regulation_panel_clock')[0].innerHTML = "<div>" + harold(hours) + ":" + harold(minutes) + "</div>";

        function harold(standIn) {
            if (standIn < 10) {
                standIn = '0' + standIn
            }
            return standIn;
        }
    }

    var showResponsibleGambling = function () {
        var htmlString = "";

        var responsibleGameUrl1 = gameFrame.domainSettings.responsibleGamingLinkConfigurationDTO.url1;
        var responsibleGameUrl2 = gameFrame.domainSettings.responsibleGamingLinkConfigurationDTO.url2;
        var responsibleGameIcon1 = gameFrame.domainSettings.responsibleGamingLinkConfigurationDTO.icon1;
        var responsibleGameIcon2 = gameFrame.domainSettings.responsibleGamingLinkConfigurationDTO.icon2;

        if (responsibleGameUrl2 != undefined && responsibleGameIcon2 != undefined) {
            htmlString += "" +
                "<div style = 'float:right; padding: 0px 5px'>" +
                "   <a id = 'responsibleGamingUrl2' href='" + responsibleGameUrl2 + "' target='_blank'>" +
                "       <img id = 'responsibleGamingIcon2' src='" + responsibleGameIcon2 + "'>" +
                "   </a>" +
                "</div>"
        }

        if (responsibleGameUrl1 != undefined && responsibleGameIcon1 != undefined) {
            htmlString += "" +
                "<div style = 'float:right; padding: 0px 5px'>" +
                "   <a id = 'responsibleGamingUrl1' href='" + responsibleGameUrl1 + "' target='_blank'>" +
                "       <img id = 'responsibleGamingIcon1' src = '" + responsibleGameIcon1 + "'>" +
                "   </a>" +
                "</div>"
        }

        $('#edict_responsibleGaming').html(htmlString);
    }

    var startTimer = function (duration, display) {
        var timer = duration, hours, minutes, seconds, refreshIntervalId;

        function calculateValuesAndUpdateTextField() {
            hours = parseInt(timer / 3600, 10);
            minutes = parseInt((timer % 3600) / 60, 10);
            seconds = parseInt(timer % 60, 10);

            hours = hours < 10 ? "0" + hours : hours;
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = hours + ":" + minutes + ":" + seconds;
        }

        //initialize textfield
        calculateValuesAndUpdateTextField();

        //refresh every second and stop if timer is finished
        refreshIntervalId = setInterval(
            function () {
                calculateValuesAndUpdateTextField();
                if (--timer < 0) {
                    timer = 0;
                    clearInterval(refreshIntervalId);
                }
            },
            1000
        );
    };

    var createPortalEnvironmentVariables = function (clientUUIDToReuse) {
        var clientUUID = typeof clientUUIDToReuse !== 'undefined'
            ? clientUUIDToReuse
            : gaming.currentGame.generateUUID();
        var gamingServicesBasePath = currentGameLauncherData.servicesGamingUrl;
        var pathDeleteMessage = gamingServicesBasePath + '/casinos/' + casino + '/messages/delete/{id}';
        var currentLanguage = currentGameLauncherData.language;

        var restUrlPattern;
        gamingServicesBasePath = window.location.protocol + '//' + window.location.host + gamingServicesBasePath;
        restUrlPattern = gamingServicesBasePath + currentGameLauncherData.restUrlPattern;
        restUrlPattern = restUrlPattern.replace('{casino}', casino);
        restUrlPattern = restUrlPattern.replace('{templateId}', currentGameLauncherData.templateId);

        function gameClientLayout() {
            return {
                depotBalanceVisible: currentGameLauncherData.gameClientLayout.depotBalanceVisible,
                stakeVisible: currentGameLauncherData.gameClientLayout.stakeVisible,
                winVisible: currentGameLauncherData.gameClientLayout.winVisible,
                coinSizesEnabled: currentGameLauncherData.gameClientLayout.coinSizesEnabled,
                lineEnabled: currentGameLauncherData.gameClientLayout.lineEnabled,
                maxBetEnabled: currentGameLauncherData.gameClientLayout.maxBetEnabled,
                autoplayEnabled: currentGameLauncherData.gameClientLayout.autoplayEnabled,
                spinEnabled: currentGameLauncherData.gameClientLayout.spinEnabled,
                fullscreenEnabled: currentGameLauncherData.gameClientLayout.fullscreenEnabled,
                soundEnabled: currentGameLauncherData.gameClientLayout.soundEnabled,
                homeEnabled: currentGameLauncherData.gameClientLayout.homeEnabled,
                paytableEnabled: currentGameLauncherData.gameClientLayout.paytableEnabled,
                helpEnabled: currentGameLauncherData.gameClientLayout.helpEnabled,
                fastSpinEnabled: currentGameLauncherData.gameClientLayout.fastSpinEnabled,
                gambleEnabled: currentGameLauncherData.gameClientLayout.gambleEnabled,
                riskLadderEnabled: currentGameLauncherData.gameClientLayout.riskLadderEnabled,
                collectEnabled: currentGameLauncherData.gameClientLayout.collectEnabled,
                responsibleGamingEnabled: currentGameLauncherData.gameClientLayout.responsibleGamingEnabled
            }
        }

        function replaceMessageIfERROR_RPC_HTTP(replaceableMessage) {
            var msg = replaceableMessage.message;
            if (msg.type === "ERROR_RPC_HTTP" && typeof msg.createdByFramework === 'undefined') {
                msg.type = XCG.edict7.errors.type.ERROR_CONNECTION_FAILED;
                msg.priority = XCG.edict7.errors.priority.HIGHEST;
                msg.gameClientAction = XCG.edict7.errors.gameClientAction.RESTART;
                msg.title = "ERROR";
                msg.text = XCG.edict7.errors.type.ERROR_CONNECTION_FAILED;
                msg.messageId = -1;
                msg.params = [{key: 'UI_ELEMENT', stringVal: 'BUTTON_RELOAD'}];
            }
            if (msg.type === 'ERROR_CONNECTION_FAILED') {
                replaceableMessage.allMessagesReadCallback = function () {
                    gameFrame.reloadGameClient();
                };
            }
        }

        portalEnv = {
            isSlotSessionActive: function () {
                return XCG.edict.slotSession.stakeSum !== undefined;
            },
            isTopBarActive: function () {
                return false;
            },
            getGameRootUrl: function () {
                return currentGameLauncherData.gameRootURL;
            },
            getVariant: function () {
                return 'default';
            },
            getLocale: function () {
                return currentLanguage;
            },
            getJurisdiction: function () {
                return currentGameLauncherData.jurisdiction;
            },
            getGameTimeoutSeconds: function () {
                var timeOut = portalEnv.getDomainOption('GAME_TIMEOUT_IN_SECONDS');
                if (typeof timeOut === 'undefined') {
                    throw {message: "DomainOption 'GAME_TIMEOUT_IN_SECONDS' is not defined"};
                }
                return timeOut;
            },
            getInitUrl: function () {
                return updateQueryStringParameter(gamingServicesBasePath + pathInit, 'gameMode', currentGameMode.toLowerCase());
            },
            getHeartbeatUrl: function () {
                var url = gamingServicesBasePath + pathCasino + pathHeartbeat;
                return updateQueryStringParameter(url, 'portalLocale', gameFrame.locale);
            },
            getSessionAliveUrl: function () {
                return gamingServicesBasePath + pathCasino + '/session';
            },
            getStartUrl: function () {
                var url = restUrlPattern.replace('{cmd}', 'start');
                return updateQueryStringParameter(url, 'portalLocale', gameFrame.locale);
            },
            getCloseUrl: function () {
                return restUrlPattern.replace('{cmd}', 'close');
            },
            getBalanceUrl: function () {
                return restUrlPattern.replace('{cmd}', 'balance');
            },
            getOnCommandUrl: function () {
                return restUrlPattern.replace('{cmd}', 'commands');
            },
            getDeleteMessageUrl: function (messageId) {
                var url = pathDeleteMessage;
                return url.replace('{id}', messageId);
            },
            getTranslations: function () {
                var translations = gameFrame.gameclienthtml5;
                if (translations) {
                    return translations;
                } else {
                    return fallbackTranslations;
                }
            },
            showMessage: function (messages, deleteMessageCallback, resumeGameCallback) {
                setTimeout(function () {
                    try {
                        messages.forEach(function (msg) {
                            var replaceableMessage = {message: msg, allMessagesReadCallback: resumeGameCallback};
                            replaceMessageIfERROR_RPC_HTTP(replaceableMessage);
                            msg = replaceableMessage.message;
                            resumeGameCallback = replaceableMessage.allMessagesReadCallback;
                            convertGameClientMessageToPortalMessage(msg);
                            var msgForDisplay = gameFrame.translations.translateMessage(msg);
                            gaming.inGameMessageCallbackStore.add(msg, function (messageId) {
                                if (resumeGameCallback) {
                                    gaming.log.debug('resume game after message is closed: ' + messageId);
                                    resumeGameCallback();
                                }
                            });
                            portalMessages.callShowMessageCallbackPortal(msgForDisplay, deleteMessageCallback);
                        });
                    } catch (err) {
                        gaming.log.debug('Error on displaying message:' + err);
                        gaming.log.debug('Stacktrace:\n' + err.stack);
                    }
                }, 500);
            },
            /**
             *
             * @param messages an array of messages to be displayed
             * @param messageReadCallback function(messageId) this function will be called with the id of the message that was marked as read
             * @param allMessagesReadCallback function() will be called after all given messages where marked as read.
             */
            showMessages: function (messages, messageReadCallback, allMessagesReadCallback) {
                function logParams() {
                    console.log('showMessages called with: ' + JSON.stringify(messages) + 'allMessagesReadCallback:' + allMessagesReadCallback);
                }

                //logParams();
                // setTimeout(function () {

                try {

                    messages.forEach(function (msg) {
                        var replaceableMessage = {message: msg, allMessagesReadCallback: allMessagesReadCallback};
                        replaceMessageIfERROR_RPC_HTTP(replaceableMessage);
                        allMessagesReadCallback = replaceableMessage.allMessagesReadCallback;
                    });

                    messages.forEach(function (msg) {
                        convertGameClientMessageToPortalMessage(msg);
                        gaming.inGameMessageCallbackStore.add(msg, messageReadCallback);
                    });
                    gaming.inGameMessageCallbackStore.setAllMessagesReadCallback(allMessagesReadCallback);
                    // messages.forEach(function (msg) {
                    gameFrame.displayMessageOnFront(messages[0]);
                    // });
                } catch (err) {
                    if (console) {
                        console.log('Error on displaying message:' + err);
                        console.log('Stacktrace:\n' + err.stack);
                    }
                }
                // }, 500);
            },
            closeGameClient: function () {
                gameFrame.closeModalDialog(currentGameLauncherData.referrerUrl);
            },
            /**
             * The backend expects the client to send a clientUUID within the request header. Subsequent requests
             * from the same client instance are expected to use the same UUID. Therefore subsequent calls to this
             * function will aways return the same value unless the page is reloaded.
             *
             * @returns a unique random string
             */
            getClientUUID: function () {
                return clientUUID;
            },
            setCommandCallback: function (commandCallback) {
                actionCommandCallback = commandCallback;
            },
            setSizeChangedCallback: function (sizeChangedCallback) {
                gameClientSizeChangedCallback = sizeChangedCallback;
            },
            minimizeClient: function () {
                gameStart.Resizing.sendFullscreenExitEvents();
            },
            maximizeClient: function () {
                gameStart.Resizing.sendFullscreenEvents();
            },
            getGameSize: gameStart.Resizing.getGameSize,
            getCurrency: function () {
                var currencyObject = {};
                if (currentGameMode.toUpperCase() === gameStart.gameMode.MONEY) {
                    currencyObject.currency = gameFrame.getCurrencyDisplayInfo().currencyCode;
                    currencyObject.currencySymbol = gameFrame.getCurrencyDisplayInfo().currencySymbol;
                } else {
                    currencyObject.currency = gameStart.gameMode.FUN;
                    currencyObject.currencySymbol = '';
                }
                currencyObject.decimalPoint = gameFrame.getCurrencyDisplayInfo().decimalSeparator;
                currencyObject.thousandsSeparator = gameFrame.getCurrencyDisplayInfo().groupSeparator;
                currencyObject.printedBefore = gameFrame.getCurrencyDisplayInfo().printedBefore;
                currencyObject.fractionDigits = gameFrame.getCurrencyDisplayInfo().fractionDigits;
                return currencyObject;
            },
            getHelpContent: function () {
                var gameKeyForHelpContent = currentGameKey.replace('_', '-');
                var url = '/eoc-content/' + this.getLocale() + '/eoc-help-content-mobile/spiele/' + gameKeyForHelpContent + '.html';
                return gaming.getHelpContentFromURL(url);
            },
            getDomainOption: function (key) {
                var domainOptions = getCasinoOptions();
                return domainOptions[key];
            },
            isResponsibleGamingActive: function () {
                return portalEnv.getDomainOption('SHOW_RESPONSIBLE_GAMING');
            },
            openResponsibleGamingUrl: function () {
                return gameFrame.linkToResponsibleGaming();
            },
            getResponsibleGamingIconPath: function () {
                return getResponsibleGamingIconPath();
            },
            getHeartbeatInterval: function () {
                return gameFrame.domainSettings.heartbeatConfiguration.heartbeatIntervalInSeconds * 1000;
            },
            logoutPortalUser: function (reason) {
                gameFrame.logout('forced', reason, currentGameLauncherData.referrerUrl);
            },
            gameLoadingStarted: function () {
                crossWindowMessaging.sendCrossWindowMessageToParent('gameLoadingStarted');
            },
            gameLoadingProgress: function (value) {
                crossWindowMessaging.sendCrossWindowMessageToParent('gameLoadingProgress: ' + value);

                value = Math.round(value);
                crossWindowMessaging.sendCrossWindowMessageToParent({name: "loadProgress", sender: "game", data: value});
            },
            gameLoadingEnded: function () {
                gameStart.Resizing.resizeGameLayer(isRegulationPanelActive(), portalEnv.isTopBarActive());
                gameStart.CasinoFreespinsLayer.showStatusLayer(true);

                if (gameFrame.audioSettings === gameFrame.getAudioSettingConfigOptions().ENABLED){
                    crossWindowMessaging.sendCommandToGame("enableAudio")
                } else if (gameFrame.audioSettings === gameFrame.getAudioSettingConfigOptions().DISABLED){
                    crossWindowMessaging.sendCommandToGame("disableAudio")
                }

                crossWindowMessaging.sendCrossWindowMessageToParent('gameLoadingEnded');
                crossWindowMessaging.sendCrossWindowMessageToParent({name: "loadCompleted", sender: "game"});

            },
            gameRoundStarted: function () {
                crossWindowMessaging.sendCrossWindowMessageToParent('gameRoundStarted');
                crossWindowMessaging.sendCrossWindowMessageToParent({name: "roundStart", sender: "game"});
            },
            gameRoundEnded: function () {
                crossWindowMessaging.sendCrossWindowMessageToParent('gameRoundEnded');
                crossWindowMessaging.sendCrossWindowMessageToParent({name: "roundEnd", sender: "game"});
            },
            stakeUpdated: function (value) {
                var emxMessage = {name: "stakeUpdate", sender: "game", data: formatMoneyValue(value)};
                crossWindowMessaging.sendCrossWindowMessageToParent(emxMessage);
                var edictMessage = "stakeUpdated: " + value;
                crossWindowMessaging.sendCrossWindowMessageToParent(edictMessage);
            },
            winUpdated: function (value) {
                var emxMessage = {name: "winUpdate", sender: "game", data: formatMoneyValue(value)};
                crossWindowMessaging.sendCrossWindowMessageToParent(emxMessage);
                var edictMessage = "winUpdated: " + value;
                crossWindowMessaging.sendCrossWindowMessageToParent(edictMessage);
            },
            balanceTooLow: function () {
                crossWindowMessaging.sendCrossWindowMessageToParent('balanceTooLow');
            },
            audioEnabled: function () {
                crossWindowMessaging.sendCrossWindowMessageToParent({name: "audioToggle", sender: "game", data: true});
                crossWindowMessaging.sendCrossWindowMessageToParent("audioEnabled");
            },
            audioDisabled: function () {
                crossWindowMessaging.sendCrossWindowMessageToParent({name: "audioToggle", sender: "game", data: false});
                crossWindowMessaging.sendCrossWindowMessageToParent("audioDisabled");
            },
            layout: (function () {
                return gameClientLayout();
            }())
        };

        function formatMoneyValue(value) {
            return formatNumber((value / Math.pow(10, 2)), 2, "", ".");
        }

        function formatNumber(amount, decPlaces, thouSeparator, decSeparator) {
            var n = amount,
                decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
                decSeparator = decSeparator == undefined ? "." : decSeparator,
                thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
                sign = n < 0 ? "-" : "",
                i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
                j = (j = i.length) > 3 ? j % 3 : 0;
            return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
        };

        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
            var separator = uri.indexOf('?') !== -1 ? '&' : '?';
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + '=' + value + '$2');
            } else {
                return uri + separator + key + '=' + value;
            }
        }

        function getResponsibleGamingIconPath() {
            return window.location.protocol + "//" + window.location.host + gameFrame.portalRoot + "images/responsibleGaming.png";
        }

        return portalEnv;
    };


    var initializeGameCommunicator = function (gameStartAndLaunchParameters) {
        gameClientSizeChangedCallback = undefined;
        actionCommandCallback = undefined;

        casino = gameStartAndLaunchParameters.casino;
        pathCasino = '/casinos/' + casino;
        pathHeartbeat = '/heartbeat';
        pathInit = '/gamesession/init?casinoName=' + casino;

        currentGameKey = gameStartAndLaunchParameters.gameKey;
        currentGameLauncherData = gameStartAndLaunchParameters;
        currentGameMode = gameStartAndLaunchParameters.gameMode;
        currentGameClientConfiguration = currentGameLauncherData.gameClientConfiguration;

        createPortalEnvironmentVariables(gameStartAndLaunchParameters.clientUUID);
    };

    var isGameClientSizeChangedCallbackDefined = function () {
        return typeof gameClientSizeChangedCallback !== undefined && typeof gameClientSizeChangedCallback !== 'undefined';
    };

    var getCasinoOptions = function () {
        var casinoOptionMap = {};
        currentGameClientConfiguration.children.forEach(function (domainOption) {
            var recursiveFindOption = function (list) {
                if (typeof list === 'undefined' || list.length === 0) {
                    return;
                }
                list.forEach(function (domainOptionChild) {
                    if (domainOptionChild.children !== undefined) {
                        recursiveFindOption(domainOptionChild.children);
                    }
                    casinoOptionMap[domainOptionChild.name] = domainOptionChild.optionValue;
                });
            };
            recursiveFindOption(domainOption.children);
        });
        return casinoOptionMap;
    };

    var getRequiredCookies = function () {
        var requiredCookiesObject = {};
        var portalUserCookie = 'portalUser';
        var portalSessionCookie = 'portalSessionId';

        if ($.cookie(portalUserCookie) && $.cookie(portalUserCookie) !== '' && $.cookie(portalUserCookie) !== '\'\'') {
            requiredCookiesObject[portalUserCookie] = $.cookie(portalUserCookie);
        }
        if ($.cookie(portalSessionCookie) && $.cookie(portalSessionCookie) !== '' && $.cookie(portalSessionCookie) !== '\'\'') {
            requiredCookiesObject[portalSessionCookie] = $.cookie(portalSessionCookie);
        }
        requiredCookiesObject['gameMode'] = currentGameMode;
        requiredCookiesObject['portalLocale'] = portalEnv.getLocale();

        return requiredCookiesObject;
    };

    var convertGameClientMessageToPortalMessage = function (msg) {
        // add PortalMessageDTO properties to GameClientMessageDTO
        msg.id = msg.messageId;
        // text property contains message type in GC messageDTO!
        msg.type = msg.text;

        if (!msg.params) {
            msg.params = [];
        }
        msg.params.forEach(function (param) {
            param.value = param.stringVal;
        });
        //convert *special* params to ui elements
        msg.uiElements = [];
        msg.params.forEach(function (param) {
            if (param.key === 'UI_ELEMENT') {
                var button = {};
                button.elementKey = param.value;
                button.elementType = 'BUTTON';
                msg.uiElements.push(button);
            }
            param.value = param.stringVal;
        });

        //add default behaviour for old messageTypes without ui elements
        if (msg.uiElements.length === 0) {
            var btn = {};
            if (msg.flags === 1) {
                btn.elementKey = 'BUTTON_OK_AND_CLOSE';
            } else {
                btn.elementKey = 'BUTTON_OK';
            }
            btn.elementType = 'BUTTON';
            msg.uiElements = [];
            msg.uiElements.push(btn);
        }

        msg.paramDTOs = msg.params;
    };

    var getEventDispatcherDictionary = function (param) {
        var dictionary = {};
        dictionary['requestPortalInformation'] = sender.createAndSendPortalInformation;
        dictionary['requestHelpContent'] = sender.createAndSendHelpContent;
        dictionary['gameLoadingStarted'] = portalEnv.gameLoadingStarted;
        dictionary['gameLoadingProgress'] = portalEnv.gameLoadingProgress;
        dictionary['gameLoadingEnded'] = portalEnv.gameLoadingEnded;
        dictionary['gameRoundStarted'] = portalEnv.gameRoundStarted;
        dictionary['gameRoundEnded'] = portalEnv.gameRoundEnded;
        dictionary['balanceTooLow'] = portalEnv.balanceTooLow;
        dictionary['closeGameClient'] = portalEnv.closeGameClient;
        dictionary['minimizeClient'] = portalEnv.minimizeClient;
        dictionary['maximizeClient'] = portalEnv.maximizeClient;
        dictionary['openResponsibleGamingUrl'] = portalEnv.openResponsibleGamingUrl;

        dictionary['logoutUser'] = function () {
            portalEnv.logoutPortalUser(param);
        };

        dictionary['showMessages'] = function () {
            var allReadCallback = function () {
                sender.sendMessageToGame('allMessagesRead', '');
            };
            var readCallback = function () {
                //dummy callback to satisfy list of function parameters
            };
            portalEnv.showMessages(param, readCallback, allReadCallback);
        };

        return dictionary;
    };

    var dispatchEvent = function (eventDataFromGame) {
        var requestObject = JSON.parse(eventDataFromGame);
        var dictionary = getEventDispatcherDictionary(requestObject.requestData);

        if (dictionary.hasOwnProperty(requestObject.requestType)) {
            dictionary[requestObject.requestType]();
        } else {
            gaming.log.debug('Received communication object with unknown type');
        }
    };

    var publicGameCommunicatorFunctions = {
        initializeGameCommunicator: initializeGameCommunicator,
        createPortalEnvironmentVariables: createPortalEnvironmentVariables,
        isGameClientSizeChangedCallbackDefined: isGameClientSizeChangedCallbackDefined,
        dispatchEvent: dispatchEvent,
        sender: sender,
        updateSlotSessionGUI: updateSlotSessionGUI
    };

    return publicGameCommunicatorFunctions;

}());

gameStart.HTML = (function () {

    var gameIframeLoadStep = function () {
        try {
            var frame = window.frames[gameStart.htmlContainerId.gameLayer];
            gaming.log.debug('Try to access core method, with frame.setPortalEnvironment or XCG.delegate.gamblingMachineEnvironment');
            if (typeof frame.setPortalEnvironment === "function" && !gaming.portalEnvInitialized) {
                gaming.log.debug('Can access core method, so do legacy init with PortalEnvironment');
                // legacy oore
                gaming.portalEnvInitialized = true;
                legacy.postMessageCommunicationWithCoreEnabled = false;
                frame.setPortalEnvironment(portalEnv);
            } else if (XCG.delegate !== undefined && typeof XCG.delegate.gamblingMachineEnvironment.resumeStartUp === 'function') {
                gaming.log.debug('Can access core method, so do init with XCG.delegate.gamblingMachineEnvironment');
                // GamblingMachineAPI 7
                legacy.postMessageCommunicationWithCoreEnabled = false;
                //setPortalEnvironment(portalEnv);
                XCG.delegate.gamblingMachineEnvironment.resumeStartUp(portalEnv);
            } else {
                gaming.log.debug('iFrame ' + frame + ' is accessible but legacy frame.setPortalEnvironment and XCG.delegate method not found, so core will send init portalMessages');
                legacy.postMessageCommunicationWithCoreEnabled = true;
            }
        } catch (exception) {
            legacy.postMessageCommunicationWithCoreEnabled = true;
            gaming.log.debug('Exception:' + exception);
            gaming.log.exception('iFrame with id ' + gameStart.htmlContainerId.gameLayer + ' is not accessible directly because legacy frame.setPortalEnvironment and XCG.delegate method not found, so core will send init portalMessages', exception);
        }
        setTimeout(window.frames[gameStart.htmlContainerId.gameLayer].focus(), 100);
    };

    var launchGame = function (gameStartParameters) {
        gameFrame.htmlGameCommunicator.initializeGameCommunicator(gameStartParameters);
        gameFrame.htmlGameCommunicator.updateSlotSessionGUI();
        gameStart.Layer.launchHTMLGameInIFrame(gameStartParameters.launchURL, gameIframeLoadStep);
    };



    return {
        launchGame: launchGame
    };
}());

/*************************************************************
 * SlotSession
 *************************************************************/

function blend_in(id) {
    document.getElementById(id).style.visibility = 'visible';
    document.getElementById('open').style.display = 'none';
    document.getElementById('close').style.display = 'block';
}

function blend_out(id) {
    document.getElementById(id).style.visibility = 'hidden';
    document.getElementById('open').style.display = 'block';
    document.getElementById('close').style.display = 'none';
}

var slotSession = (function () {
    var callback;

    var onSlotSessionInputValidated = function (slotSessionData) {
        if (sendCreateSlotSessionRequest(slotSessionData).good) {
            callback();
        }
    };

    var createSlotSession = function (slotSessionOpen, onSuccessCallback) {
        if (slotSessionOpen !== true && slotSessionOpen !== 'true') {
            callback = onSuccessCallback;
            showSlotSessionDialog(onSlotSessionInputValidated);
        } else {
            //slot session is already open no dialog needed, proceed.
            onSuccessCallback();
        }
    };

    var sendCreateSlotSessionRequest = function (slotSessionData) {
        var playerID = gameFrame.playerID;
        var url;

        if (!playerID || playerID === '\'\'') {
            return {good: true};
        } else {
            try {
                url = new gameStart.ServiceUri().createGameLaunchSlotSessionUri(gameFrame.casino, playerID, slotSessionData.maxLossAmount, slotSessionData.maxSessionTime)
                    + '?realityCheckPeriod=' + computeValueToMilliSecs(slotSessionData.realityCheckPeriod, 'm');

                if (slotSessionData.disclaimerPeriod && slotSessionData.disclaimerPeriodUnit) {
                    url = url + '&disclaimerPeriod=' + computeValueToMilliSecs(slotSessionData.disclaimerPeriod, slotSessionData.disclaimerPeriodUnit);
                }
            } catch (err) {
                if (console) {
                    console.log('Error creating url from slotSessionData values:' + err);
                    console.log('Stacktrace:\n' + err.stack);
                }
            }
            // eoc.slotSessionData = {};
            var slotSessionResponse = {good: false};
            $.ajax({
                url: url,
                data: '',
                type: 'POST',
                async: false,
                error: gameFrame.getAjaxErrorHandler,
                success: function (data) {
                    slotSessionResponse.good = true;
                    slotSessionResponse.showSlotSessionInClient = data.slotSessionDTO.showSlotSessionInClient;
                }
            });
            return slotSessionResponse;
        }
    };

    var getSlotSessionDisclaimerPeriodUnits = function () {
        return {
            m: gameFrame.messagesTranslated['SLOT_SESSION_CONFIG_UNIT_MINUTES'],
            h: gameFrame.messagesTranslated['SLOT_SESSION_CONFIG_UNIT_HOURS'],
            D: gameFrame.messagesTranslated['SLOT_SESSION_CONFIG_UNIT_DAYS'],
            W: gameFrame.messagesTranslated['SLOT_SESSION_CONFIG_UNIT_WEEKS'],
            M: gameFrame.messagesTranslated['SLOT_SESSION_CONFIG_UNIT_MONTHS']
        };

    };

    var getSlotSessionMaxSessionTimeUnits = function () {
        return {
            m: gameFrame.messagesTranslated['SLOT_SESSION_CONFIG_UNIT_MINUTES'],
            h: gameFrame.messagesTranslated['SLOT_SESSION_CONFIG_UNIT_HOURS']
        };
    };

    var showSlotSessionDialog = function (onSlotSessionInputValidated) {
        var DEFAULTS = {
            maxSessionTime: 2,
            maxSessionTimeUnit: "h",
            maxLossAmount : 200,
            realityCheckPeriod: 10
        };

        var getValue = function (inputName) {
            return $("input[name='" + inputName + "']").val();
        };

        var getSelectionValue = function (field) {
            return $("#" + field).val();
        };

        var maxSessionTimeTranslation = gameFrame.messagesTranslated["SLOT_SESSION_CONFIG_MAX_SESSION_TIME"];
        var maxSessionTimeContent = '</td><td><input id="maxSessionTimeInput" type="text" name="maxSessionTimeInput" value="' +DEFAULTS.maxSessionTime + '">'
            + '<input type="hidden" id="maxSessionTime" name="maxSessionTime" value="">'
            + '<select name="maxSessionTimeUnit" id="maxSessionTimeUnit" size="1">';
        $.each(getSlotSessionMaxSessionTimeUnits(), function (key, value) {
            if(key === DEFAULTS.maxSessionTimeUnit){
                maxSessionTimeContent += '<option selected=true id=' + key + ' + value=' + key + '>' + value + '</option>';
            }else{
                maxSessionTimeContent += '<option id=' + key + ' + value=' + key + '>' + value + '</option>';
            }
        });
        maxSessionTimeContent += '</select>';
        maxSessionTimeTranslation = maxSessionTimeTranslation.replace("{INPUT_FIELD}", maxSessionTimeContent);

        var maxLossTranslation = gameFrame.messagesTranslated["SLOT_SESSION_CONFIG_MAX_LOSS"];
        maxLossTranslation = maxLossTranslation.replace("{INPUT_FIELD}", '</td><td><input id="maxLossAmountInput" type="text" name="maxLossAmountInput" value="' + DEFAULTS.maxLossAmount + '">' +
            '<input type="hidden" id="maxLossAmount" name="maxLossAmount" value="">');
        maxLossTranslation = maxLossTranslation.replace("{CURRENCY_SYMBOL}", gameFrame.getCurrencyDisplayInfo().currencySymbol);

        var realityCheckTranslation = gameFrame.messagesTranslated["SLOT_SESSION_CONFIG_REALITY_CHECK_PERIOD"];
        realityCheckTranslation = realityCheckTranslation.replace("{INPUT_FIELD}", '</td><td><input id="realityCheckPeriod" type="text" name="realityCheckPeriod" value="' + DEFAULTS.realityCheckPeriod + '">');

        var disclaimerTranslation = gameFrame.messagesTranslated["SLOT_SESSION_CONFIG_DISCLAIMER_PERIOD"];
        var disclaimerPeriodContent = '</td><td><input id="disclaimerPeriod" type="text" name="disclaimerPeriod" value="">'
            + '<select name="disclaimerPeriodUnit" id="disclaimerPeriodUnit" size="1">';
        $.each(getSlotSessionDisclaimerPeriodUnits(), function (key, value) {
            disclaimerPeriodContent += '<option value=' + key + '>' + value + '</option>';
        });
        disclaimerPeriodContent += '</select>';

        disclaimerTranslation = disclaimerTranslation.replace("{INPUT_FIELD}", disclaimerPeriodContent);
        
        var moreButtonLabel = gameFrame.messagesTranslated["SLOT_SESSION_BUTTON_MORE"];
        var okButtonLabel = gameFrame.messagesTranslated["SLOT_SESSION_CONFIG_OK_BUTTON"];
        var buttons = {};
        buttons[okButtonLabel] = 1;
        var slotConfigFormId = "slotConfigForm";
        var slotSessionDialog = {
            slotConfigForm: {
                title: gameFrame.messagesTranslated["SLOT_SESSION_CONFIG_TITLE"],
                html: '<div id="' + slotConfigFormId + '"><table><tr><td class="first">' + maxSessionTimeTranslation + '</td><td><div class="error" id="maxSessionTime_error"></div></td></tr>' +
                '<tr><td class="first">' + maxLossTranslation + '</td><td><div class="error" id="maxLossAmount_error"></div></td></tr>' +
                '<tr><td class="first">' + realityCheckTranslation + '</td><td><div class="error" id="realityCheckPeriod_error"></div></td></tr>' +
                '<tr><td><a href="javascript:blend_in(\'zeile\')" id="open">&#9658; ' + moreButtonLabel + ' </a><br><a href="javascript:blend_out(\'zeile\')"id="close" style="display:none;">&#9660;</a></td><td></td><td></td></tr>' +
                '<tr style="visibility: hidden;" id="zeile" ><td class="first">' + disclaimerTranslation + '</td><td><div class="error" id="disclaimerPeriod_error"></div></td></tr>' +
                '</table><input id="clientContextId" type="hidden" name="clientContextId" value="SLOT_SESSION"></div>',
                buttons: buttons,
                //width wird per css angepasst 
                position: {width: 590},
                submit: function (e, v, m, f) {
                    function resetValidationErrors() {
                        $("#" + slotConfigFormId + " .error").html("");
                    }

                    resetValidationErrors();
                    var sessionTimeToValidate = getValue("maxSessionTimeInput");
                    if (/^[0-9]+$/.test(sessionTimeToValidate)) {
                        sessionTimeToValidate = computeValueToMilliSecs(sessionTimeToValidate, getSelectionValue("maxSessionTimeUnit"));
                    }
                    $("#maxSessionTime").val(sessionTimeToValidate);

                    var maxLossAmountInCent = gameFrame.convertAmountInCents(getValue("maxLossAmountInput"));
                    $("#maxLossAmount").val(maxLossAmountInCent);
                    if (maxLossAmountInCent !== "error") {
                        $("#maxLossAmountInput").val(gameFrame.formatAmountForDisplay(maxLossAmountInCent));
                    }

                    var validated = validation.validateForm("#" + slotConfigFormId);
                    if (validated) {
                        var data = {
                            maxLossAmount: getValue("maxLossAmount"),
                            maxSessionTime: getValue("maxSessionTime"),
                            maxSessionTimeUnit: getSelectionValue("maxSessionTimeUnit"),
                            realityCheckPeriod: getValue("realityCheckPeriod"),
                            disclaimerPeriod: getValue("disclaimerPeriod"),
                            disclaimerPeriodUnit: getSelectionValue("disclaimerPeriodUnit")
                        };
                        onSlotSessionInputValidated(data);
                    } else {
                        e.preventDefault();
                    }
                }
            }
        };
        $.prompt(slotSessionDialog);
        //now bring message to front:
        $(".jqibox").css("z-index", "10000002");
    };


    var computeValueToMilliSecs = function (value, unit) {
        var SECONDS = 1000;
        var MINUTES = 60 * SECONDS;
        var HOURS = 60 * MINUTES;
        var DAYS = 24 * HOURS;
        var WEEKS = 7 * DAYS;
        var MONTHS = 30 * DAYS;
        var unitInMilliseconds = {
            s: SECONDS,
            m: MINUTES,
            h: HOURS,
            D: DAYS,
            W: WEEKS,
            M: MONTHS
        };
        var factor = unitInMilliseconds[unit];
        if (!factor) {
            throw {message: 'can not convert from unit ' + unit};
        }
        if (!value) {
            throw {message: 'value must be defined'};
        }
        return value * factor;
    };

    return {
        createSlotSession: createSlotSession
    };
})();

/*************************************************************
 * FormValidation
 *************************************************************/
/**
 * The validation is done in two stages: first the client-side and then the server-side validation
 */
var validation = function () {
    // Validation rules

    var validationRules = [
        {
            form: "#slotConfigForm",
            validator: "slotsession",
            fields: {
                server: ["maxLossAmount", "maxSessionTime", "realityCheckPeriod", "disclaimerPeriod", "clientContextId"],
                client: []
            },
            clientValidators: [],
            validateAfterSubmit: [
                {
                    fieldName: "maxLossAmount",
                    errors: {
                        4242: "portal-services.validations.slotsession.maxSlotSessionLossAmount.not_null",
                        4243: "portal-services.validations.slotsession.maxSlotSessionLossAmount.pattern",
                        4244: "portal-services.validations.slotsession.maxSlotSessionLossAmount.min_value",
                        4245: "portal-services.validations.slotsession.maxSlotSessionLossAmount.amount_greater_balance"
                    }
                },
                {
                    fieldName: "maxSessionTime",
                    errors: {
                        4242: "portal-services.validations.slotsession.maxSlotSessionTime.not_null",
                        4243: "portal-services.validations.slotsession.maxSlotSessionTime.pattern",
                        4244: "portal-services.validations.slotsession.maxSlotSessionTime.min_value"
                    }
                },
                {
                    fieldName: "realityCheckPeriod",
                    errors: {
                        4242: "portal-services.validations.slotsession.slotSessionRealityCheckPeriod.not_null",
                        4243: "portal-services.validations.slotsession.slotSessionRealityCheckPeriod.pattern",
                        4244: "portal-services.validations.slotsession.slotSessionRealityCheckPeriod.min_value",
                        4245: "portal-services.validations.slotsession.slotSessionRealityCheckPeriod.max_value"
                    }
                },
                {
                    fieldName: "disclaimerPeriod",
                    errors: {
                        4242: "portal-services.validations.slotsession.slotSessionDisclaimerPeriod.pattern",
                        4243: "portal-services.validations.slotsession.slotSessionDisclaimerPeriod.min_value"
                    }
                }
            ]
        }
    ];

    var findValidationRuleForForm = function (form) {
        var formValidationRule = {};
        for (var i = 0; i < validationRules.length; i++) {
            if (validationRules[i].form === form) {
                formValidationRule = validationRules[i];
                break;
            }
        }
        return formValidationRule;
    };

    var validateForm = function (form) {
        var layoutForClientValidationError = 'standard';

        // find validationRule for given form in eoc.configuration.js
        var formValidationRule = findValidationRuleForForm(form);


        //resume which fields should be validated: try function parameters first, then look into formvalidationRule
        var fieldsForClientValidation = formValidationRule.fields;


        var errors = serverSideValidation(form, fieldsForClientValidation.server);
        resetValidationErrors(form);

        // -- Display errors for the current request.
        var validationOK = true;
        if (errors.length > 0) {
            for (var i = 0; i < errors.length; i++) {
                showValidationErrors(errors[i].errors, errors[i].fieldName, form, layoutForClientValidationError);
            }
            validationOK = false;
        }
        return validationOK;
    };

    var serverSideValidation = function (form, fieldsForServerSideValidation) {
        var errors = [];
        var validationResponse;

        // find validationRule for given form in eoc.configuration.js
        var formValidationRule = findValidationRuleForForm(form);

        var defaultValidator = formValidationRule && formValidationRule.validator ? formValidationRule.validator : undefined;
        var validatorOnServerSide = defaultValidator;

        if (fieldsForServerSideValidation && fieldsForServerSideValidation.length > 0) {
            var validationRequest = buildValidationRequest(form, fieldsForServerSideValidation);
            validationResponse = sendValidationRequest(validationRequest, validatorOnServerSide);
        }
        if (validationResponse) {
            for (var i = 0; i < validationResponse.errorList.length; i++) {
                var error = validationResponse.errorList[i];
                var serverValidationError = {
                    fieldName: error.fieldName,
                    errors: error.validationErrors
                };
                errors.push(serverValidationError);
            }
        }
        return errors;
    };

    var buildValidationRequest = function (form, fieldsForServerSideValidation) {
        var field;
        var validationRequest = {
            fieldsForValidation: []
        };

        function getCheckboxValue(fieldValue) {
            if ($("input[name='" + fieldValue + "']").prop("checked")) {
                return $("input[name='" + fieldValue + "']").val();
            }
            else {
                return 'false';
            }
        }

        function getRadioButtonValue(fieldValue) {
            var value = $("input[name='" + fieldValue + "']:checked").val();
            return (!value ? '' : value);
        }

        function getSelectOrTextFieldValue(fieldValue) {
            if ($('#' + fieldValue)[0].tagName === 'SELECT') {
                return $('#' + fieldValue).val();
            } else {
                return $("input[name='" + fieldValue + "']").val();
            }
        }

        function fieldExists() {
            return ($(form + ' #' + field).val() || $(form + " input[name='" + field + "']").val());
        }

        for (var i = 0; i < fieldsForServerSideValidation.length; i++) {
            field = fieldsForServerSideValidation[i];
            validationRequest.fieldsForValidation.push(field);
            var value;
            // Only validate if field exists
            if (fieldExists()) {
                switch ($("input[name='" + field + "']").attr('type')) {
                    case 'checkbox':
                        value = getCheckboxValue(field);
                        break;
                    case 'radio':
                        value = getRadioButtonValue(field);
                        break;
                    default:
                        value = getSelectOrTextFieldValue(field);
                        break;
                }
                validationRequest[field] = value;
            }
        }
        return validationRequest;
    };
    var sendValidationRequest = function (validationRequest, specialValidator) {
        var validationRequestString = JSON.stringify({item: validationRequest});
        // now validate
        var validationResponse = {};
        $.ajax({
            url: new gameStart.ServiceUri().createPortalValidationsUri(gameFrame.casino, specialValidator),
            data: validationRequestString,
            contentType: 'application/json; charset=utf-8',
            type: 'POST',
            async: false,
            error: gameFrame.ajaxErrorHandling,
            success: function (data) {
                validationResponse.validationList = data;
                validationResponse.errorList = data.simpleListDTO.list.item;
            }
        });
        return validationResponse;
    };

    /* -------------------------------------------------------- * /
    /*                                                          */
    /*               Validation Error Display                   */
    /*                                                          */
    /* -------------------------------------------------------- */

    /**
     * Clean up or rather hide all occurred error messages.
     *
     * The method requires the presence of the class "error" for all affected elements.
     *
     * @param form The name/id string of the form with a leading hash "#".
     * @param validatedFields
     * @param errorLayout
     */
    var resetValidationErrors = function (form) {
        var errorElements = $('form' + form + ' .error');
        errorElements.css('display', 'none');
        errorElements.html('');
        errorElements.removeClass('invalid'); // TODO: check whether this class is still in use
    };

    var showValidationErrors = function (errors, field, form) {

        if (errors !== undefined && !Array.isArray(errors)) {
            console.error("the variable 'errors' is not an array! ");
        }

        /**
         * Enforce that an expected string is actual a string.
         * @param {String} subject string
         */
        var enforceStringValue = function (subject) {
            if (typeof subject !== 'undefined') {
                return subject;
            }
            return '';
        };

        /**
         * A string replace function that also works with or rather on undefined subjects.
         *
         * @param subject The string being searched and replaced on.
         * @param search The value being searched for.
         * @param replacement The replacement value that replaces found search values.
         * @returns A string with the replaced values or an empty string if the given subject is undefined.
         */
        var replace = function (subject, search, replacement) {
            subject = enforceStringValue(subject);
            return subject.replace(search, replacement);
        };

        var errorHTML = "";
        var errorText = "";
        var errorString = '';
        for (var j = 0; j < errors.length; j++) {
            var errorElement = errors[j];
            var messageKeyFromErrorElement = errorElement.messageKey;
            var errorParameters = errorElement.parameters;
            if (errorParameters && errorParameters.entry && Array.isArray(errorParameters.entry) && errorParameters.entry.length > 0) {
                var firstEntryOfErrorInParameters = errorParameters.entry[0];
                if (firstEntryOfErrorInParameters && firstEntryOfErrorInParameters.key && firstEntryOfErrorInParameters.value) {
                    var valueForReplacement = firstEntryOfErrorInParameters.value.value;
                    if (firstEntryOfErrorInParameters.value.type === 'Money') {
                        valueForReplacement = gameFrame.convertAmountToCurrency(firstEntryOfErrorInParameters.value.value, gameFrame.domainSettings.currency);
                    }
                    errorString = replace(gameFrame.errorsTranslated[messageKeyFromErrorElement], new RegExp("{" + firstEntryOfErrorInParameters.key + "}"), valueForReplacement);
                }
            } else {
                errorString = enforceStringValue(gameFrame.errorsTranslated[messageKeyFromErrorElement]);
            }

            errorString = errorString.replace("'", "&rsquo;");

            errorHTML += '<div title="' + errorString + '" style="color:red"><strong>X</strong></div>';
            if (j > 0) {
                errorText = errorText + ", ";
            }
            errorText = errorText + errorString;

        }
        // These elements must exist in the validated form for each form element
        if ($("#" + field + "_error").is("p")) {
            $("#" + field + "_error").html(errorText);
        } else {
            $("#" + field + "_error").html(errorHTML);
        }
        $("#" + field + "_error").css("display", "block");
    };


    return {
        validateForm: validateForm
    };
}();




var crossWindowMessaging = (function () {
    var sendCrossWindowMessageToParent = function (message) {
        if (window.self !== window.top) {
            gaming.log.debug('sending cross message ' + JSON.stringify(message) + ' to domain ' + document.referrer);
            parent.postMessage(message, document.referrer);
        } else {
            gaming.log.debug('stop forwarding cross window messages because window not run in iframe: ' + message);
        }
    };

    var    sendCrossWindowMessageToChildFrame = function (frameID, message) {
        var iframe = document.getElementById(frameID);
        if (iframe) {
            gaming.log.debug('sending cross message ' + message + ' to frame ' + frameID + '  with domain ' + iframe.src);
            iframe.contentWindow.postMessage(message, iframe.src);
        } else {
            gaming.log.debug('cross message cannot be sent, because the target frame ' + frameID + ' was not found');
        }
    };

    var  sendCommandToGame = function (message) {
        if (gameFrame.gameClientRunning) {
            if (message.sender && message.name) {
                if (message.sender === "emwindow") {
                    switch (message.name) {
                        case 'updateBalance':
                            gameFrame.htmlGameCommunicator.sender.updateDepot();
                            break;
                        case 'showHelp':
                            gameFrame.htmlGameCommunicator.sender.showHelp();
                            break;
                        case 'togglePaytable':
                            gameFrame.htmlGameCommunicator.sender.togglePaytable();
                            break;
                        case 'setAudio':
                            if (message.data === 'true') {
                                gameFrame.htmlGameCommunicator.sender.enableAudio();
                            } else if (message.data === 'false') {
                                gameFrame.htmlGameCommunicator.sender.disableAudio();
                            } else {
                                gaming.log.debug('unknown cross window emx message data caught: ' + message);
                            }
                            break;
                        case 'modalWindowOpened':
                            gameFrame.htmlGameCommunicator.sender.pauseAutoPlayAfterGameRound();
                            break;
                        case 'modalWindowClosed':
                            gameFrame.htmlGameCommunicator.sender.resumeAutoPlay();
                            break;
                        default:
                            gaming.log.debug('unknown cross window emx message caught: ' + message);
                    }
                }
            } else if (message.type && message.payload) {
                switch (message.type) {
                    case 'getWallet':
                        gameFrame.htmlGameCommunicator.sender.updateDepot();
                        break;
                    case 'pauseAutoSpin':
                        gameFrame.htmlGameCommunicator.sender.pauseAutoPlayAfterGameRound();
                        break;
                    case 'resumeAutoSpin':
                        gameFrame.htmlGameCommunicator.sender.resumeAutoPlay();
                        break;
                    default:
                        gaming.log.debug('unknown whow message caught: ' + message);
                }
            } else {
                switch (message) {
                    case 'pauseGame':
                        gameFrame.htmlGameCommunicator.sender.pauseGame();
                        break;
                    case 'resumeGame':
                        gameFrame.htmlGameCommunicator.sender.resumeGame();
                        break;
                    case 'enableAudio':
                        gameFrame.htmlGameCommunicator.sender.enableAudio();
                        break;
                    case 'disableAudio':
                        gameFrame.htmlGameCommunicator.sender.disableAudio();
                        break;
                    case 'updateBalance':
                        gameFrame.htmlGameCommunicator.sender.updateDepot();
                        break;
                    case 'toggleHelp':
                        gameFrame.htmlGameCommunicator.sender.toggleHelp();
                        break;
                    case 'showHelp':
                        gameFrame.htmlGameCommunicator.sender.showHelp();
                        break;
                    case 'closeHelp':
                        gameFrame.htmlGameCommunicator.sender.closeHelp();
                        break;
                    case 'togglePaytable':
                        gameFrame.htmlGameCommunicator.sender.togglePaytable();
                        break;
                    case 'showPaytable':
                        gameFrame.htmlGameCommunicator.sender.showPaytable();
                        break;
                    case 'closePaytable':
                        gameFrame.htmlGameCommunicator.sender.closePaytable();
                        break;
                    case 'startGame':
                        gameFrame.htmlGameCommunicator.sender.startGame();
                        break;
                    case 'pauseAutoPlay':
                        gameFrame.htmlGameCommunicator.sender.pauseAutoPlayAfterGameRound();
                        break;
                    case 'resumeAutoPlay':
                        gameFrame.htmlGameCommunicator.sender.resumeAutoPlay();
                    default:
                        gaming.log.debug('unknown cross window message caught: ' + message);
                }
            }
        } else {
            gaming.log.debug('No game is running so ignore message');
        }
    };

    var registerCrossWindowMessageEventListener = function () {
        var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
        var eventer = window[eventMethod];
        var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';
        eventer(messageEvent, function (e) {
            if (e) {
                gaming.log.debug('Received CrossWindowMessage ' + e.data);
                var gameIFrame = document.getElementById(gameStart.htmlContainerId.gameLayer);
                if (e.source === window.parent) {
                    gaming.log.debug('Message received from external parent page.');
                    crossWindowMessaging.sendCommandToGame(e.data);
                } else if (gameIFrame && e.source === gameIFrame.contentWindow) {
                    gaming.log.debug('Message received from game iframe');
                    gameFrame.htmlGameCommunicator.dispatchEvent(e.data);
                } else {
                    gaming.log.debug('Unknown message origin:' + e.origin);
                    gaming.log.debug(e);
                }
            }
        }, false);
    };

    return {
        registerCrossWindowMessageEventListener: registerCrossWindowMessageEventListener,
        sendCommandToGame: sendCommandToGame,
        sendCrossWindowMessageToChildFrame: sendCrossWindowMessageToChildFrame,
        sendCrossWindowMessageToParent: sendCrossWindowMessageToParent
    };
}());
// register for post messages from parent window
crossWindowMessaging.registerCrossWindowMessageEventListener();

function processMobileAppDomainEvent (message){
    switch (message.type) {
        case 'getWallet':
            gameFrame.htmlGameCommunicator.sender.updateDepot();
            break;
        case 'pauseAutoSpin':
            gameFrame.htmlGameCommunicator.sender.pauseAutoPlayAfterGameRound();
            break;
        case 'resumeAutoSpin':
            gameFrame.htmlGameCommunicator.sender.resumeAutoPlay();
            break;
        default:
            gaming.log.debug('unknown whow message caught: ' + message);
    }
};
gameFrame.closeSession = function () {
    if (gameFrame.activeGameTemplateId !== '') {
        var response = {};
        var url = gameStart.servicesGamingPath;
        url = url.replace('{casino}', gameFrame.casino);
        url = url.replace('{templateId}', gameFrame.activeGameTemplateId);
        url = url.replace('{cmd}', 'close');
        $.ajax({
            url: url,
            data: '{"de.edict.eoc.gaming.comm.GameSessionRequestDTO":{"command":"close","gameSessionUuid":"' + gaming.currentGame.clientUUID + '"}}',
            type: 'POST',
            contentType: 'application/json',
            async: false,
            error: function () {
            },
            success: function (data) {
            }
        });
        gameFrame.activeGameTemplateId = '';
        return response;
    }
};

gameStart.registerResizePeriodically = function () {
    if (gameFrame.gameClientTypeRunning) {
        setTimeout(function () {
            gameStart.registerResizePeriodically();
        }, 1000);
    }
};

gameStart.startGamePostAction = function (gameStartParameters) {
    if (gameStartParameters.gameTechnology === gameStart.getGameStartGameClientTypes().HTML5) {
        // gameStart.registerResizePeriodically();
    }
};

gameStart.Gamestart = (function () {

    var gameGateGameLaunch = function (gameStartParameters) {
        gaming.log.debug('Start game gate game ' + gameStartParameters.gameKey + ' with ' + gameStartParameters.gameClientEnvironment + ' game start and ' + gameStartParameters.gameClientType + ' client');

        var externalServerUrlWithParams = gameStartParameters.gameDTOExternal.externalServerUrlWithParams;

        if (gameStartParameters.gameClientEnvironment !== gameFrame.getGameChannels().MOBILE) {
            gameStart.Layer.launchHTMLGameInIFrame(externalServerUrlWithParams);
        } else {
            $(location).attr('href', externalServerUrlWithParams);
        }
        gameFrame.externalClientRunning = true;
    };

    var internalGameLaunch = function (gameStartParameters) {
        gameFrame.externalClientRunning = false;
        if (gameStartParameters.gameClientType === gameStart.getGameStartGameClientTypes().FLASH && gameFrame.playerLoggedIn) {
            // if FLASH games not supported anymore - please remove this if-clause
            gameStart.heartbeatTimer.stop();
        }
        switch (gameStartParameters.gameClientType) {
            case gameStart.getGameStartGameClientTypes().HTML5:
                return gameStart.HTML.launchGame(gameStartParameters);
            case gameStart.getGameStartGameClientTypes().FLASH:
                return gameStart.FLASH.launchGame(gameStartParameters);
            default:
                gaming.log.exception('EGB_GAMELAUNCH_FAILED', 'Start internal game ' + gameStartParameters.gameKey + ' with client type ' + gameStartParameters.gameClientType + ' not implemented ');
        }
    };

    var startGame = function (gameStartParameters) {
        setTimeout(function () {
            gameStart.ETracker.sendETrackerDataAsynchronous(gameStartParameters.eTrackerCode, gameStartParameters.gameKey, gameStartParameters.gameMode);
            gameStart.Layer.initialize();

            portalMessages.setMessagesCallback(gameStartParameters.showMessageCallback);

            // wird verwendet, um später die GameSession zu schließen
            //gameFrame.activeGameTemplateId = gameStartParameters.templateId;
            //gameStart.servicesGamingPath = gameStartParameters.servicesGamingUrl + gameStartParameters.restUrlPattern;
            if (gameStartParameters.gameDTOExternal && gameStartParameters.gameDTOExternal != 'undefined') {
                gameGateGameLaunch(gameStartParameters);
            } else {
                internalGameLaunch(gameStartParameters);
            }
            // gameStart.startGamePostAction(gameStartParameters);
        }, 1000);
    };

    return {
        startGame: startGame
    };
}());

gameStart.getGameLaunchData = function (params) {
    var hasFlashQueryParam = '?flashInstalled=' + params.flashAvailable;
    var referrerQueryParam = '&referrerUrl=' + params.referrerUrl;
    var gameLauncherData = {};
    $.ajax({
        url: new gameStart.ServiceUri().createGameLaunchDataUri(params.casino, params.playerID, params.gameKey, params.templateName, params.gameMode, params.language) + hasFlashQueryParam + referrerQueryParam,
        data: '',
        type: 'GET',
        async: false,
        error: gameFrame.getAjaxErrorHandler,
        success: function (data) {
            gameLauncherData = data.gameLauncherDataDTO;
        }
    });
    return gameLauncherData;
};

gameStart.getPlaytechGameModeFromParam = function (playtechURLParameterReal) {
    switch (playtechURLParameterReal) {
        case '0':
            return gameStart.gameMode.FUN;
        case '1':
            return gameStart.gameMode.MONEY;
        case '2':
            throw {message: 'url param "real=2" (free spin mode) is not supported'};
        default:
            throw {message: 'url param value"' + playtechURLParameterReal + '"is not supported'};
    }
};

gameStart.getReferrerUrl = function (urlParams) {
    var referrerUrl = urlParams.referrerUrl ? urlParams.referrerUrl : urlParams.backurl;
    if (referrerUrl && referrerUrl !== '') {
        return decodeURIComponent(referrerUrl);
    } else {
        return decodeURIComponent(window.location.href);
    }
};

gameStart.getGameLaunchParameters = function (urlParams, language, playerDTO) {

    var playerID;
    if (!playerDTO || !playerDTO.id) {
        playerID = 'null';
    } else {
        playerID = playerDTO.id;
    }
    var gameStartParams = {
        referrerUrl: gameStart.getReferrerUrl(urlParams),
        playerID: playerID,
        gameKey: gameStart.getGameKeyFromURL(urlParams),
        flashAvailable: isFlashAvailable(),
        casino: urlParams.casino,
        templateName: 'default',
        gameMode: urlParams.gameMode ? urlParams.gameMode : gameStart.getPlaytechGameModeFromParam(urlParams.real),
        language: language,
    };

    function isFlashAvailable() {
        if (typeof swfobject !== 'undefined') {
            return swfobject.hasFlashPlayerVersion(gameStart.getMinimumFlashVersion());
        } else {
            return false;
        }
    };

    return gameStartParams;
};

gameStart.getGameKeyFromURL = function (urlParams) {
    var gameKey = urlParams.gameKey;
    if (!gameKey) {
        // Playtech = game || Nyx  = gameid
        gameKey = urlParams.game ? urlParams.game : urlParams.gameid;
    }
    return gameKey;
};

gameStart.getGameStartParameters = function (urlParams, gameLaunchData) {

    gameFrame.gameClientTypeRunning = gameLaunchData.gameTechnology;

    var referrerUrl = gameStart.getReferrerUrl(urlParams);
    var gameStartParams = {
        gameMode: urlParams.gameMode ? urlParams.gameMode : gameStart.getPlaytechGameModeFromParam(urlParams.real),
        gameKey: gameStart.getGameKeyFromURL(urlParams),
        gameRootURL: gameLaunchData.gameRootURL,
        casino: urlParams.casino,
        templateName: gameLaunchData.casinoGameTemplateName,
        referrerUrl: referrerUrl,
        showMessageCallback: gameFrame.showInGameMessageCallback,
        gameDTOExternal: gameLaunchData.gameDTOExternal,
        gamePlayable: gameLaunchData.gamePlayable,
        gameClientType: gameLaunchData.gameTechnology,
        gameClientEnvironment: gameLaunchData.gameChannel,
        slotSessionOpen: gameLaunchData.slotSessionOpen,
        gameNotPlayableMessage: gameLaunchData.gameNotPlayableMessage,
        language: gameLaunchData.language,
        messageDTO: gameLaunchData.messageDTO,
        templateId: gameLaunchData.templateId,
        servicesGamingUrl: gameLaunchData.servicesGamingUrl,
        restUrlPattern: gameLaunchData.restUrlPattern,
        launchURL: gameLaunchData.launchURL,
        fileName: gameLaunchData.fileName,
        launcherType: gameLaunchData.launcherType,
        gameClientConfiguration: gameLaunchData.gameClientConfiguration,
        legacyGameName: gameLaunchData.legacyGameName,
        showSlotSessionInClient: gameLaunchData.showSlotSessionInClient,
        casinoGameTemplateName: gameLaunchData.casinoGameTemplateName,
        gameTechnology: gameLaunchData.gameTechnology,
        gameChannel: gameLaunchData.gameChannel,
        eTrackerCode: gameLaunchData.eTrackerCode,
        jurisdiction: gameLaunchData.jurisdiction,
        gameClientLayout: gameLaunchData.gameClientLayoutDTO,

        logErrorMessages: function (message) {
            document.getElementById('eocMessage-dialog-p').innerHTML = message.messageString;
            document.getElementById('eocMessage-dialog').style.display = 'block';
            document.getElementById('eocMessageOk').onclick = function () {
                document.getElementById('eocMessage-dialog').style.display = 'none';
            };
        }
    };

    return gameStartParams;
};

function setGlobalVariable(urlParams) {
    gameFrame.casino = urlParams.casino;
    gameFrame.domainSettings = gameStart.getDomainSettings(urlParams.casino);
    var language;
    if (urlParams.lang != undefined) {
         language = urlParams.lang.substring(0, 2);
    }else if (urlParams.language != undefined) {
        language = urlParams.language.substring(0, 2);
    }
    if(gameFrame.domainSettings.languages.indexOf(language) == -1){
        language = gameFrame.domainSettings.defaultLanguage;
    }
    gameFrame.locale = language;
    gameFrame.translations.loadSystemTextTranslations();

    if (urlParams.sound !== undefined) {
        if (urlParams.sound === '1'){
            gameFrame.audioSettings = gameFrame.getAudioSettingConfigOptions().ENABLED;
        } else if (urlParams.sound === '0') {
            gameFrame.audioSettings = gameFrame.getAudioSettingConfigOptions().DISABLED;
        } else {
            gameFrame.audioSettings = gameFrame.getAudioSettingConfigOptions().DEFAULT;
        }
    } else {
        gameFrame.audioSettings = gameFrame.getAudioSettingConfigOptions().DEFAULT;
    }
}

gameStart.initialStartRemoteGame = function () {
    var messages = [];

    function showMessagesBeforeGamestart(onSuccessCallback) {
        var cnt;

        function messageCallback(proceed) {
            if (!proceed) {
                onSuccessCallback(false);
            } else {
                cnt--;
                if (cnt === 0) {
                    onSuccessCallback(true);
                }
            }
        }

        if (Array.isArray(messages) && messages.length > 0) {
            cnt = messages.length;
            for (var i = 0; i < messages.length; i++) {
                handleMessage(messages[i], messageCallback);
            }
        } else {
            onSuccessCallback(true);
        }
    }

    function handleMessage(message, onSuccessCallback) {
        var translatedMessage = gameFrame.translations.translateMessage(message);
        showGameStartDialog(translatedMessage, function (e, v) {
            if (v === 'BUTTON_OK' || v === 'BUTTON_CONTINUE') {
                onSuccessCallback(true);
            } else {
                onSuccessCallback(false);
            }
        });
    }

    function showGameStartDialog(translatedMessage, callback) {
        var messageOptions = {};
        messageOptions.submit = callback;
        messageOptions.buttons = gameFrame.defineMessageButtons(translatedMessage.uiElements);
        messageOptions.loaded = function () {
            $('.jqiclose').css('display', 'none');
        };
        $.prompt(translatedMessage.messageString, messageOptions);
        //now bring message to front:
        $('.jqibox').css('z-index', '10000002');
    }

    try {
        gameStart.browserDetect.init();
        if (gameStart.browserDetect.preflightCheck()) {
            var urlParams = gameStart.getUrlParams();
            setGlobalVariable(urlParams);

            var authResponse = gameStart.Authorization.authorizePlayer(urlParams);
            if (authResponse.messages && authResponse.messages.length > 0) {
                messages = authResponse.messages;
            } else if (authResponse.error && authResponse.error.params.length > 0) {
                gaming.log.exception(authResponse.error.params[0].stringVal, authResponse.error.params[0]);
                return;
            }
            // heartbeat started for messages and dialogs before gaming
            if( gameFrame.playerLoggedIn) {
                gameStart.heartbeatTimer.start();
            }

            // gamelaunch
            var gameLaunchParameters = gameStart.getGameLaunchParameters(urlParams, authResponse.language, authResponse.playerDTO);

            var launchDataDTO = gameStart.getGameLaunchData(gameLaunchParameters);
            if (launchDataDTO.messageDTO) {
                messages.push(launchDataDTO.messageDTO);
            }
            var gameStartParameters = gameStart.getGameStartParameters(urlParams, launchDataDTO);

            gameStart.updateLanguage(gameStartParameters.language);

            if (!gameStartParameters.gamePlayable) {
                gaming.log.debug('Game is not playable: ' + gameStartParameters.gameNotPlayableMessage);
                gaming.log.exception(gameStartParameters.gameNotPlayableMessage.type);
            }
            gameFrame.activeGameTemplateId = gameStartParameters.templateId;
            gameFrame.gameStartParameters = gameStartParameters;
            gameStart.servicesGamingPath = gameStartParameters.servicesGamingUrl + gameStartParameters.restUrlPattern;
            showMessagesBeforeGamestart(function (proceed) {
                if (proceed) {
                    slotSession.createSlotSession(gameStartParameters.slotSessionOpen, function () {
                        gameStart.Gamestart.startGame(gameStartParameters);
                    });
                } else {
                    crossWindowMessaging.sendCrossWindowMessageToParent('notifyCloseContainer');
                }
            });
        }
    }
    catch (e) {
        gaming.log.exception('EGB_GAMELAUNCH_FAILED', e);
    }
};
/*************************************************************
 * gameStart.connector
 *************************************************************/
gameStart.createConnector = function () {

    var jsessionid = null;

    var connector = {};

    var blockGameRequests = false;

    var queue = [];

    /**
     * Function used internal for sending a synchronous ajax-request.
     * @param method http method used for the request
     * @param requestURL url for the request
     * @param dto body of the request
     * @returns {{}}
     */
    var sendSync = function (method, requestURL, dto) {
        var response = {};
        var url = appendSessionIDToURL(requestURL, jsessionid);
        $.ajax({
            beforeSend: function (request) {
                request.setRequestHeader('Content-Type', 'application/json');
                if( XCG.edict.portalInformation !== undefined) {
                    request.setRequestHeader("clientUUID", XCG.edict.portalInformation.getClientUUID());
                }
            },
            url: url,
            data: JSON.stringify(dto),
            type: method,
            async: false,
            success: function (data, textStatus, jqXHR) {
                XCG.debug.log(textStatus + ': ' + data);
                response.status = jqXHR.status;
                response.data = data;
                jsessionid = retrieveSessionIDFromResponse(jqXHR);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                XCG.debug.log('WARNING:' + textStatus + ': ' + jqXHR.status + errorThrown);
                response = jqXHR;
            },
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        });
        return response;
    };
    /**
     * Function used internal for sending an asynchronous ajax-request.
     * @param method http method used for the request
     * @param requestURL url for the request
     * @param dto body of the request
     * @param retries times to retry request
     * @param callbackMethod method to be called
     *
     */
    var sendAsync = function (method, requestURL, dto, retries, callbackMethod) {
        var retries = retries;
        var url = appendSessionIDToURL(requestURL, jsessionid);
        $.ajax({
            beforeSend: function (request) {
                request.setRequestHeader('Content-Type', 'application/json');
                if( XCG.edict.portalInformation !== undefined) {
                    request.setRequestHeader("clientUUID", XCG.edict.portalInformation.getClientUUID());
                }
            },
            url: url,
            data: JSON.stringify(dto),
            type: method,
            async: true,
            success: function (data, textStatus, jqXHR) {
                XCG.debug.log(textStatus + ': ' + data);
                XCG.debug.log('jSessionID: ' + retrieveSessionIDFromResponse(jqXHR));
                callbackMethod(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                XCG.debug.log('WARNING:' +textStatus + ': ' + jqXHR.status + errorThrown);
                if (retries > 0) {
                    retries--;
                    sendAsync(method, requestURL, dto, retries, callbackMethod)
                }
                gameStart.connectionErrors.handleErrors(jqXHR);
            },
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true
        });
    };

    /**
     * Sends the given request-object with ajax.
     * @param {object} requestObject object containing the request
     * @param {function} responseCallback called on incoming response
     * @returns {*} response object
     */
    connector.sendGameRequest = function (requestObject, responseCallback, synchron) {
        if (blockGameRequests) {
            queue.push({
                request: requestObject,
                callback: responseCallback,
                sync: synchron
            });
        } else if (synchron === 'false' || synchron === false) {
            executeAsyncRequest(requestObject, responseCallback);
            connector.synchron = false;
        }
        else {
            responseCallback(executeSyncRequest(requestObject));
            connector.synchron = true;
        }
    };

    function executeSyncRequest(requestObject) {
        var retryPolicy = requestObject.retryPolicy;
        var response = {};

        var send = function () {
            response = sendSync(requestObject.method, requestObject.urlPath, requestObject.dtoObject);
            return gameStart.connectionErrors.statusHasError(response);
        };

        executeMultiple(retryPolicy, send);
        gameStart.connectionErrors.handleErrors(response);
        return response.data;
    }

    function executeSyncRequestWithoutErrorHandling(requestObject) {
        var retryPolicy = requestObject.retryPolicy;
        var response = {};

        var send = function () {
            response = sendSync(requestObject.method, requestObject.urlPath, requestObject.dtoObject);
            return true;
        };

        executeMultiple(retryPolicy, send);
        return response.data;
    }

    function executeAsyncRequest(requestObject, responseCallback) {
        sendAsync(requestObject.method, requestObject.urlPath, requestObject.dtoObject, requestObject.retryPolicy, responseCallback);
    }

    connector.sendCoreRequest = function (requestObject, withoutErrorHandling) {
        if( withoutErrorHandling === true) {
            return executeSyncRequestWithoutErrorHandling(requestObject);
        }
        return executeSyncRequest(requestObject);
    };

    connector.blockGameRequests = function () {
        blockGameRequests = true;
        XCG.debug.log("blocking requests");

    };

    connector.unblockGameRequests = function () {
        XCG.debug.log("unblocking requests queue.length=" + queue.length);
        var o;
        blockGameRequests = false;
        while (queue.length > 0) {
            o = queue.shift();
            o.callback(executeSyncRequest(o.request));

        }
    };

    connector.isBlocked = function () {
        return blockGameRequests;
    };

    /**
     * Appends the JESSIONID to the request URL if needed. If none JSESSIONID is given, the unchanged URL will be returned.
     * @param {String} url The original request url
     * @param {String} sessionID Optional jsessionID, if given it will be appended.
     * @returns {String} the altered request URL
     */
    function appendSessionIDToURL(url, sessionID) {
        var urlWithSession;
        if (url) {
            if (sessionID) {
                XCG.debug.log('Using JSESSIONID for request:' + sessionID);
                var addition = ';jsessionid=' + sessionID;
                var parameterStartIndex = url.indexOf('?');
                if (parameterStartIndex >= 0) {
                    var serverAddress = url.substring(0, parameterStartIndex);
                    var urlParameters = url.substring(parameterStartIndex);
                    urlWithSession = serverAddress + addition + urlParameters;
                } else {
                    urlWithSession = url + addition;
                }
            } else {
                urlWithSession = url;
            }
        }
        XCG.debug.log('Request URL: ' + urlWithSession);
        return urlWithSession;
    }

    /**
     * Extracts the JSESSIONID from response, null when none is found.
     * Thats the case when it was send as set-cookie
     * @param {type} jqXHR Response
     * @returns {String} The extracted JSESSIONID or null.
     */
    function retrieveSessionIDFromResponse(jqXHR) {
        var headerValueSessionID = jqXHR.getResponseHeader('JSESSIONID');
        if (headerValueSessionID && headerValueSessionID !== '') {
            XCG.debug.log('Found JSESSIONID in response: ' + headerValueSessionID);
            return headerValueSessionID;
        } else {
            XCG.debug.log('None JSESSIONID found in response, seems to be in cookie mode. ');
            return null;
        }
    }

    connector.setGamingCookies = function (cookies) {
        var options = {path: '/'};
        for (var cookieName in cookies) {
            // skip loop if the property is from prototype
            if (!cookies.hasOwnProperty(cookieName)) {
                continue;
            }
            var cookieValue = cookies[cookieName];
            createCookie(cookieName, cookieValue, options);
        }
    };

    var createCookie = function (name, value, options) {
        var expires = '';
        if (options.days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + value + expires + '; path=' + options.path;
    };

    /**
     * Executes a function executable multiple times if an executeCondition returned by the executable
     * applies.
     *
     * @param times the function executable should get executed
     * @param executable
     */
    var executeMultiple = function (times, executable) {
        var executeCondition;
        var count = 0;
        do {
            executeCondition = executable();
            count++;
        } while (count <= times && executeCondition);
        return executeCondition;
    };

    return connector;
};

gameStart.connector = gameStart.createConnector();

/*************************************************************
 * gameStart.connectionErrors
 *************************************************************/
gameStart.connectionErrors = function () {

    function handleErrors(response) {
        var errorHandler = XCG.edict.errors;
        var error;
        if (statusHasError(response)) {
            if (statusIsServerError(response)) {
                error = errorHandler.generateServerErrorDTO(response);
            } else if (statusIsConnectionLostError(response)){
                error = errorHandler.generateConnectionLostErrorDTO(response);
            } else {
                error = errorHandler.generateCommunicationErrorDTO(response);
            }
            errorHandler.handleError(error);
            response.requestSuccess = false;
        } else {
            response.requestSuccess = true;
        }
    }

    function statusHasError(response) {
        return !statusBetween(response, XCG.edict.RESPONSE_OK_LOWER_BOUNDARY, XCG.edict.RESPONSE_OK_UPPER_BOUNDARY);
    }

    function statusIsServerError(response) {
        return statusBetween(response, XCG.edict.RESPONSE_SERVER_ERROR_LOWER_BOUNDARY, XCG.edict.RESPONSE_SERVER_ERROR_UPPER_BOUNDARY);
    }

    function statusIsConnectionError(response) {
        return statusBetween(response, XCG.edict.RESPONSE_CONNECTION_ERROR_LOWER_BOUNDARY, XCG.edict.RESPONSE_CONNECTION_ERROR_UPPER_BOUNDARY);
    }

    function statusIsConnectionLostError(response) {
        return response.status == XCG.edict.RESPONSE_CLIENT_ERROR;
    }

    function statusBetween(response, lowerBoundary, upperBoundary) {
        return response.status >= lowerBoundary && response.status <= upperBoundary;
    }

    return {
        handleErrors: handleErrors,
        statusHasError: statusHasError
    };
}();
/*************************************************************
 * gameStart.heartbeatTimer
 *************************************************************/

gameStart.createHeartBeat = function (callBackFunction) {

    var defaultHeartbeatInterval = 45000;
    var heartbeatInterval;
    var running = false;

    var heartBeatTimer = {};

    var configureHeartbeatInterval = function () {
        //Use fallback value for heartbeat as default
        heartbeatInterval = defaultHeartbeatInterval;
        //but check if portal might provides another
        // if (XCG.edict.portalInformation.getHeartbeatInterval()) {
        //     var heartbeatIntervalFromPortal = XCG.edict.portalInformation.getHeartbeatInterval();
        //     if (heartbeatIntervalFromPortal && typeof heartbeatIntervalFromPortal === 'number') {
        //         heartbeatInterval = heartbeatIntervalFromPortal;
        //         XCG.debug.log("Use heartbeat interval provided by portal: " + heartbeatInterval + " milliseconds");
        //     } else {
        //
        //         XCG.debug.log("Portal does not provide suitable heartbeat interval value (Got " + heartbeatIntervalFromPortal + "), use fallback value of " + heartbeatInterval + " milliseconds");
        //     }
        // } else {
        //     XCG.debug.log("Portal does not provide method for getHeartbeatInterval(), use fallback value of " + heartbeatInterval + " milliseconds");
        // }
    };

    var sendHeartBeatInGame = function () {
        var connector = XCG.edict.connector;
        var req = XCG.edict.requestTypes.heartBeatRequest();
        var dtoObject;
        if (running) {
            var response = connector.sendCoreRequest(req);
            connector.blockGameRequests();
            if (response[XCG.edict.DTO_NAME_HAERTBEAT_RESPONSE] !== undefined) {
                dtoObject = response[XCG.edict.DTO_NAME_HAERTBEAT_RESPONSE];
                if (dtoObject !== undefined){
                    var depotDTO = dtoObject["depot"];
                    if (depotDTO !== undefined) {
                        gameFrame.htmlGameCommunicator.sender.updateDepot(depotDTO);
                    }
                }
            } else {
                dtoObject = response[XCG.edict.DTO_NAME_RESPONSE];
            }
            XCG.edict.messaging.handleMessages4HeartBeat(dtoObject);
            connector.unblockGameRequests();
            setTimeout(sendHeartBeat, heartbeatInterval);
            XCG.debug.log("sendHeartBeat");
            if (callBackFunction) {
                callBackFunction(response);
            }
        }
    };

    var sendHeartBeatWhileLoading = function () {
        // var req = XCG.edict.requestTypes.heartBeatRequest();
        var url = new gameStart.ServiceUri().createHeartBeatUri(gameFrame.casino, gameFrame.locale);
        var req = {
            urlPath: url,
            // dtoObject: '',
            // retryPolicy: 0,
            method: 'POST'
        };
        // var dtoObject;
        if (running) {
            gameStart.connector.sendCoreRequest(req, true);
            // gameStart.connector.blockGameRequests();
            // dtoObject = response[XCG.edict.DTO_NAME_RESPONSE];
            // XCG.edict.messaging.handleMessages(dtoObject, connector.unblockGameRequests);
            setTimeout(sendHeartBeat, heartbeatInterval);
            XCG.debug.log("sendHeartBeat");
            // if (callBackFunction) {
            //     callBackFunction(response);
            // }
        }
    };

    var sendHeartBeat = function () {
        if (XCG.edict.connector !== undefined) {
            sendHeartBeatInGame();
        } else {
            sendHeartBeatWhileLoading();
        }
    };

    heartBeatTimer.start = function () {
        if (!running) {
            XCG.debug.log("start heartBeatTimer");
            configureHeartbeatInterval();
            running = true;
            sendHeartBeat();
        } else {
            XCG.debug.log("heartbeat already running");
        }

    };

    heartBeatTimer.stop = function () {
        running = false;
    };

    return heartBeatTimer;
};

gameStart.heartbeatTimer = gameStart.createHeartBeat();

XCG.edict7.connector = gameStart.connector;
XCG.edict7.connectionErrors = gameStart.connectionErrors;
XCG.edict7_1.connector = gameStart.connector;
XCG.edict7_1.connectionErrors = gameStart.connectionErrors;

