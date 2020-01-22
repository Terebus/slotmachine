<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="user-scalable=no">
    <!--<meta name="viewport" content="width=device-width, initial-scale=1">-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1, shrink-to-fit=no">
    <title>EGB GameLauncher Basic Implementation</title>
    <!-- TODO check what we actually need here -->
    <script type="text/javascript" src="javascripts/libs/jquery-1.11.0.min.js"></script>
    <script type="text/javascript" src="javascripts/libs/jquerypp.custom.js"></script>
    <script type="text/javascript" src="javascripts/libs/jquery-form.js"></script>
    <script type="text/javascript" src="javascripts/libs/jquery-impromptu.js"></script>
    <script type="text/javascript" src="javascripts/libs/jquery.countdown.min.js"></script>
    <script type="text/javascript" src="javascripts/libs/jquery.gritter.min.js"></script>
    <script type="text/javascript" src="javascripts/libs/accounting.js"></script>

    <script type="text/javascript" src="javascripts/gaming.lib.js"></script>
    <script type="text/javascript" src="javascripts/libs/date.js"></script>
    <script type="text/javascript" src="javascripts/libs/swfobject.js"></script>
    <link href="css/basic.css" rel="stylesheet" type="text/css"/>
    <link href="css/eocMessages.css" rel="stylesheet" type="text/css"/>
    <link rel="shortcut icon" href="images/favicon.ico" type="image/png"/>
    <link rel="icon" href="images/favicon.ico" type="image/png"/>

    <script type="text/javascript">
        function mobileAppDomainEvent(message) {
            processMobileAppDomainEvent(message);
        }

        $(document).ready(function () {

            setTimeout(function () {
                gameStart.initialStartRemoteGame();
            }, 300);

        });
    </script>
</head>
<body onunload="gameFrame.closeSession();">
<div id="eocMessage-dialog" style="display: none">
    <p id="eocMessage-dialog-p" style="font-size: 2em;"></p>
    <button id="eocMessageOk">OK</button>
</div>
<header>
    <div id="edict_top_bar">
    </div>
</header>
<main>
    <div id="edict_game_layer" style="position: absolute; margin: 0;">

        <div id="freespin_status_container" class="freespin-flex-container" style="display: none;">
            <div id="freespin_text" class="freespin_flex-items-left-dynamic"></div>
            <div id="freespin_status" class="freespin_flex-items-right-dynamic"></div>
            <div class="freespin_flex-items-right-image"></div>
        </div>
    </div>
</main>
<footer>
    <div id="edict_regulation_panel">
        <div id="slotSessionRemainingTimeActive">
            <div style="float: left; padding-right: 5px">
                <img src="images/stopwatch.png" name="stop_watch" style="height: 12px"/>
            </div>
            <div id="slotSessionRemainingTime" style="float:left"></div>
        </div>
        <div id="slotSessionRemainingLimitActive">
            <div style="float:left; padding-right: 5px">
                <img src="images/coinstack.png" name="coin_stack" style="height: 12px"/>
            </div>
            <div id="slotSessionRemainingLimit" style="float:left"></div>
        </div>
        <div id="edict_regulation_panel_clock"></div>
        <div id="edict_responsibleGaming"></div>
        <div id="mobile-style"></div>
        <div id="edict_slot_session_statistics"></div>
    </div>
</footer>
</body>
</html>
