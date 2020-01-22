<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Class CasinoController
 *
 * @package App\Http\Controllers
 */
class CasinoController extends Controller
{
    public function start(Request $request)
    {
        $data = [
            'de.edict.eoc.gaming.comm.JoinSessionResponseDTO' =>
                [
                    'gameMode'        => 'FUN',
                    'gameSessionUuid' => '09c11be9-cdb4-4574-b399-83a1d79921f8',
                    'depot'           =>
                        [
                            'balance'      => 250000000,
                            'limitBalance' => 250000000,
                        ],
                    'gameSpecs'       =>
                        [
                            'minimalStake' => 1000,
                            'maximalStake' => 5000000,
                        ],
                    'playerSettings'  =>
                        [
                        ],
                ],
        ];

        return response()->json($data);
    }

    public function launchData(Request $request)
    {
        $data = [
            'gameLauncherDataDTO' =>
                [
                    'launcherType'            => 'directly',
                    'launchURL'               => '/gameclient/2.0/adp/xtra10liner/html/index-mobile.html',
                    'gameRootURL'             => '/gameclient/2.0/adp/xtra10liner/html',
                    'fileName'                => '/gameclient/2.0/adp/xtra10liner/html/index-mobile.html',
                    'restUrlPattern'          => '/casinos/{casino}/v2/templates/{templateId}/fun/commands/{cmd}',
                    'language'                => 'en',
                    'gameTechnology'          => 'HTML5',
                    'gameChannel'             => 'DESKTOP',
                    'jurisdiction'            => 'UNREGULATED',
                    'templateId'              => 14244,
                    'casinoGameTemplateName'  => 'xtra10liner_default_virtual_default',
                    'gamePlayable'            => true,
                    'gameClientConfiguration' =>
                        [
                            'systemErrorCode' => 0,
                            'returnCode'      => 200,
                            'id'              => 470586258254,
                            'name'            => 'DESKTOP',
                            'optionValue'     => '',
                            'parentName'      => 'HTML5',
                            'children'        =>
                                [

                                    [
                                        'systemErrorCode' => 0,
                                        'returnCode'      => 200,
                                        'id'              => 470586258255,
                                        'name'            => 'CORE',
                                        'optionValue'     => '',
                                        'parentName'      => 'DESKTOP',
                                        'children'        =>
                                            [

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258261,
                                                    'name'            => 'SHOW_HELP_BUTTON',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Enables or disables the help button. Enabled= true,
        disabled= false, should be enabled, except for terminal',
                                                ],
                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258264,
                                                    'name'            => 'CALL_MAGIE_ONLINE_ON_GAME_START_URL',
                                                    'optionValue'     => 'http://mega.web.de/cgi-bin/sbg-status?game_started=true',
                                                    'optionType'      => 'java.lang.String',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],
                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258259,
                                                    'name'            => 'SHOW_VOLUME_CONTROL',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Enables or disables the volume control panel.
        Enabled= true, disabled= false, should be generally enabled',
                                                ],
                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258260,
                                                    'name'            => 'SHOW_GAME_MENU_BAR',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],
                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258257,
                                                    'name'            => 'SHOW_CLOSE_BUTTON',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Enables or disables the close button. Enabled= true,
        disabled= false, should be disabled for EGBs',
                                                ],
                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258263,
                                                    'name'            => 'CALL_MAGIE_ONLINE_ON_GAME_START',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258265,
                                                    'name'            => 'GAME_TIMEOUT_IN_SECONDS',
                                                    'optionValue'     => '900',
                                                    'optionType'      => 'java.lang.Long',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Defines the length of the period after which the
        player is logged out for inactivity',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258266,
                                                    'name'            => 'SHOW_RESPONSIBLE_GAMING',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Enables or disables the responsible gaming icon.
        Enabled= true, disabled= false, must be enabled for Spain-TKS. For EGB see REGULATION_PANEL settings',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258262,
                                                    'name'            => 'SHOW_TIME_DISPLAY',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Enables or disables the clock. Enabled= true,
        disabled= false, must be enabled for UK, Malta, Spain',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258256,
                                                    'name'            => 'SHOW_FULLSCREEN_BUTTON',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Enables or disables the fullscreen button.
        Enabled= true, disabled= false, should be disabled for EGBs',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258258,
                                                    'name'            => 'SHOW_SETTINGS_CONTROL',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'CORE',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Enables or disables the settings icon. Enabled=
        true, disabled= false, should be generally enabled',
                                                ],
                                            ],
                                        'description'     => 'n/a',
                                    ],

                                    [
                                        'systemErrorCode' => 0,
                                        'returnCode'      => 200,
                                        'id'              => 470586258267,
                                        'name'            => 'GAME',
                                        'optionValue'     => '',
                                        'parentName'      => 'DESKTOP',
                                        'children'        =>
                                            [

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258289,
                                                    'name'            => 'ENABLE_HARDWARE_KEY_03',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258286,
                                                    'name'            => 'ENABLE_RISK_LADDER',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Defines, whether ladder risk feature is available in
        the games. Enabled= true, disabled= false',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258280,
                                                    'name'            => 'ENABLE_AUTOPLAY',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Defines, whether autoplay is available in the games.
        Enabled= true, disabled= false',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258284,
                                                    'name'            => 'AUTOPLAY_RESET_TO_START_VALUE',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Determines if the number of AUTOPLAY spins
        is automatically reset to the initial value (see `AUTOPLAY_START_VALUE`) once the AUTOPLAY counter reaches zero
        (and AUTOPLAY stops).',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258290,
                                                    'name'            => 'ENABLE_HARDWARE_KEY_04',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258275,
                                                    'name'            => 'SHOW_BUTTON_BAR',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258270,
                                                    'name'            => 'SHOW_HELP_EXIT_BUTTON',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258276,
                                                    'name'            => 'SHOW_MONEY_VALUE_SELECTION_CONTROL',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258281,
                                                    'name'            => 'SHOW_AUTOPLAY_CONTROL',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258272,
                                                    'name'            => 'SHOW_GAME_MENU_BAR',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258285,
                                                    'name'            => 'ENABLE_RISK_CARDS',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Defines, whether card risk feature is available in the
        games. Enabled= true, disabled= false',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258277,
                                                    'name'            => 'MINIMAL_GAMERUN_DURATION',
                                                    'optionValue'     => 1,
                                                    'optionType'      => 'java.lang.Integer',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Defines the minimal duration between two game
        starts. If no or a very low value is configured, the games run with their originally designed duration. Values:
        positive numbers (milliseconds), maximum implemented in the games is ~10 seconds',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258271,
                                                    'name'            => 'SHOW_PAYTABLE_EXIT_BUTTON',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258293,
                                                    'name'            => 'ENABLE_HARDWARE_KEY_07',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258283,
                                                    'name'            => 'AUTOPLAY_SPIN_STEPS',
                                                    'optionValue'     => '-1',
                                                    'optionType'      => 'java.lang.String',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'This option defines a variable set of values for
        increasing and decreasing the number of AUTOPLAY spins. The value " - 1" can be used for an infinite number of
        AUTOPLAY spins. Values: positive numbers plus the (-1) for unlimited',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258292,
                                                    'name'            => 'ENABLE_HARDWARE_KEY_06',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258287,
                                                    'name'            => 'ENABLE_HARDWARE_KEY_01',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258274,
                                                    'name'            => 'SHOW_PAYTABLE_IN_EXTERNAL_DISPLAY',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258291,
                                                    'name'            => 'ENABLE_HARDWARE_KEY_05',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258268,
                                                    'name'            => 'ENABLE_QUICKSPIN',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'if set to true, an option to shorten or skip the reel
        animation automatically may be available in the game',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258288,
                                                    'name'            => 'ENABLE_HARDWARE_KEY_02',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258273,
                                                    'name'            => 'SHOW_TIME_DISPLAY',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258294,
                                                    'name'            => 'AUTOPLAY_EXPERTMODE',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [

                                                            [
                                                                'systemErrorCode' => 0,
                                                                'returnCode'      => 200,
                                                                'id'              => 470586258301,
                                                                'name'            => 'AUTOPLAY_BONUS_ENABLED',
                                                                'optionValue'     => false,
                                                                'optionType'      => 'java.lang.Boolean',
                                                                'parentName'      => 'AUTOPLAY_EXPERTMODE',
                                                                'children'        =>
                                                                    [

                                                                        [
                                                                            'systemErrorCode' => 0,
                                                                            'returnCode'      => 200,
                                                                            'id'              => 470586258302,
                                                                            'name'            => 'AUTOPLAY_BONUS_MANDATORY',
                                                                            'optionValue'     => false,
                                                                            'optionType'      => 'java.lang.Boolean',
                                                                            'parentName'      => 'AUTOPLAY_BONUS_ENABLED',
                                                                            'children'        =>
                                                                                [
                                                                                ],
                                                                            'description'     => 'Depends on `GAME.AUTOPLAY_EXPERTMODE.AUTOPLAY_BONUS_ENABLED`. If enabled, player must chose to end autoplay on
        bonus win. Enabled= true, disabled= false',
                                                                        ],
                                                                    ],
                                                                'description'     => 'Enables or disables the
        option to stop autoplay when hitting a bonus round (ony visible in game which feature a bonus). Enabled= true,
        disabled= false',
                                                            ],

                                                            [
                                                                'systemErrorCode' => 0,
                                                                'returnCode'      => 200,
                                                                'id'              => 470586258305,
                                                                'name'            => 'AUTOPLAY_JACKPOT_ENABLED',
                                                                'optionValue'     => false,
                                                                'optionType'      => 'java.lang.Boolean',
                                                                'parentName'      => 'AUTOPLAY_EXPERTMODE',
                                                                'children'        =>
                                                                    [

                                                                        [
                                                                            'systemErrorCode' => 0,
                                                                            'returnCode'      => 200,
                                                                            'id'              => 470586258306,
                                                                            'name'            => 'AUTOPLAY_JACKPOT_MANDATORY',
                                                                            'optionValue'     => false,
                                                                            'optionType'      => 'java.lang.Boolean',
                                                                            'parentName'      => 'AUTOPLAY_JACKPOT_ENABLED',
                                                                            'children'        =>
                                                                                [
                                                                                ],
                                                                            'description'     => 'n/a',
                                                                        ],
                                                                    ],
                                                                'description'     => 'n/a',
                                                            ],

                                                            [
                                                                'systemErrorCode' => 0,
                                                                'returnCode'      => 200,
                                                                'id'              => 470586258303,
                                                                'name'            => 'AUTOPLAY_FREESPINS_ENABLED',
                                                                'optionValue'     => false,
                                                                'optionType'      => 'java.lang.Boolean',
                                                                'parentName'      => 'AUTOPLAY_EXPERTMODE',
                                                                'children'        =>
                                                                    [

                                                                        [
                                                                            'systemErrorCode' => 0,
                                                                            'returnCode'      => 200,
                                                                            'id'              => 470586258304,
                                                                            'name'            => 'AUTOPLAY_FREESPINS_MANDATORY',
                                                                            'optionValue'     => false,
                                                                            'optionType'      => 'java.lang.Boolean',
                                                                            'parentName'      => 'AUTOPLAY_FREESPINS_ENABLED',
                                                                            'children'        =>
                                                                                [
                                                                                ],
                                                                            'description'     => 'Depends on `GAME.AUTOPLAY_EXPERTMODE.AUTOPLAY_FREESPINS_ENABLED`. If enabled, player must chose to end autoplay
        on free spins. Enabled= true, disabled= false',
                                                                        ],
                                                                    ],
                                                                'description'     => 'Enables or disables the
        option to stop autoplay when hitting a free spins (ony visible in game which feature free spins). Enabled= true,
        disabled= false',
                                                            ],

                                                            [
                                                                'systemErrorCode' => 0,
                                                                'returnCode'      => 200,
                                                                'id'              => 470586258295,
                                                                'name'            => 'AUTOPLAY_LOSSLIMIT_ENABLED',
                                                                'optionValue'     => false,
                                                                'optionType'      => 'java.lang.Boolean',
                                                                'parentName'      => 'AUTOPLAY_EXPERTMODE',
                                                                'children'        =>
                                                                    [

                                                                        [
                                                                            'systemErrorCode' => 0,
                                                                            'returnCode'      => 200,
                                                                            'id'              => 470586258297,
                                                                            'name'            => 'LOSSLIMITRANGE_PERCENTAGE',
                                                                            'optionValue'     => 100,
                                                                            'optionType'      => 'java.lang.Integer',
                                                                            'parentName'      => 'AUTOPLAY_LOSSLIMIT_ENABLED',
                                                                            'children'        =>
                                                                                [
                                                                                ],
                                                                            'description'     => 'Depends on `GAME.AUTOPLAY_EXPERTMODE.AUTOPLAY_LOSSLIMIT_ENABLED`. Cap to the limit to be set by the player.
        Values: Percentage up to 100, should always be set to 100%',
                                                                        ],

                                                                        [
                                                                            'systemErrorCode' => 0,
                                                                            'returnCode'      => 200,
                                                                            'id'              => 470586258296,
                                                                            'name'            => 'AUTOPLAY_LOSSLIMIT_MANDATORY',
                                                                            'optionValue'     => false,
                                                                            'optionType'      => 'java.lang.Boolean',
                                                                            'parentName'      => 'AUTOPLAY_LOSSLIMIT_ENABLED',
                                                                            'children'        =>
                                                                                [
                                                                                ],
                                                                            'description'     => 'Depends on `GAME.AUTOPLAY_EXPERTMODE.AUTOPLAY_LOSSLIMIT_ENABLED`. If enabled, player must set a limit. Enabled=
        true, disabled= false, must be enabled for UK',
                                                                        ],
                                                                    ],
                                                                'description'     => 'Enables or disables the
        option to stop autoplay on defined decrease of account balance. Enabled= true, disabled= false, must be enabled
        for UK',
                                                            ],

                                                            [
                                                                'systemErrorCode' => 0,
                                                                'returnCode'      => 200,
                                                                'id'              => 470586258298,
                                                                'name'            => 'AUTOPLAY_WINLIMIT_ENABLED',
                                                                'optionValue'     => false,
                                                                'optionType'      => 'java.lang.Boolean',
                                                                'parentName'      => 'AUTOPLAY_EXPERTMODE',
                                                                'children'        =>
                                                                    [

                                                                        [
                                                                            'systemErrorCode' => 0,
                                                                            'returnCode'      => 200,
                                                                            'id'              => 470586258299,
                                                                            'name'            => 'AUTOPLAY_WINLIMIT_MANDATORY',
                                                                            'optionValue'     => false,
                                                                            'optionType'      => 'java.lang.Boolean',
                                                                            'parentName'      => 'AUTOPLAY_WINLIMIT_ENABLED',
                                                                            'children'        =>
                                                                                [
                                                                                ],
                                                                            'description'     => 'Depends on `GAME.AUTOPLAY_EXPERTMODE.AUTOPLAY_WINLIMIT_ENABLED`. If enabled, player must set an amount. Enabled=
        true, disabled= false',
                                                                        ],

                                                                        [
                                                                            'systemErrorCode' => 0,
                                                                            'returnCode'      => 200,
                                                                            'id'              => 470586258300,
                                                                            'name'            => 'WINLIMITRANGE_PERCENTAGE',
                                                                            'optionValue'     => 100,
                                                                            'optionType'      => 'java.lang.Integer',
                                                                            'parentName'      => 'AUTOPLAY_WINLIMIT_ENABLED',
                                                                            'children'        =>
                                                                                [
                                                                                ],
                                                                            'description'     => 'Depends on `GAME.AUTOPLAY_EXPERTMODE.AUTOPLAY_WINLIMIT_ENABLED`. Cap to the amount to be set by the player,
        based on current stake and highest paytable win. Values: Percentage up to 100, should always be set to 100%',
                                                                        ],
                                                                    ],
                                                                'description'     => 'Enables or disables the
        option to stop autoplay when achieving a single win equal or higher than the configured amount. Enabled= true,
        disabled= false, must be enabled for UK',
                                                            ],
                                                        ],
                                                    'description'     => 'Enables or disables the expert autoplay. Enabled=
        true, disabled= false, must be enabled for UK and if any dependent option shall be used',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258269,
                                                    'name'            => 'ENABLE_SKIP_REELSPIN',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'if set to true an option to manually skip the
        animation of a single spin, e.g. click spin again, may be activated',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258278,
                                                    'name'            => 'ENABLE_FULLSCREEN_START',
                                                    'optionValue'     => false,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258279,
                                                    'name'            => 'SHOW_PAYTABLE_BUTTON',
                                                    'optionValue'     => true,
                                                    'optionType'      => 'java.lang.Boolean',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'n/a',
                                                ],

                                                [
                                                    'systemErrorCode' => 0,
                                                    'returnCode'      => 200,
                                                    'id'              => 470586258282,
                                                    'name'            => 'AUTOPLAY_START_VALUE',
                                                    'optionValue'     => 0,
                                                    'optionType'      => 'java.lang.Integer',
                                                    'parentName'      => 'GAME',
                                                    'children'        =>
                                                        [
                                                        ],
                                                    'description'     => 'Start value for autoplay. Should be 0(ZERO) for
        HTML5 games.',
                                                ],
                                            ],
                                        'description'     => 'All settings for options handled by the game',
                                    ],
                                ],
                            'description'     => 'n/a',
                        ],
                    'clientCurrency'          => 'FUM',
                    'clientCurrencySymbol'    => 'Funmoney',
                    'eTrackerCode'            => 'code',
                    'servicesGamingUrl'       => '/services/gaming/5/v2/gateway',
                    'slotSessionOpen'         => true,
                    'showSlotSessionInClient' => false,
                    'gameNotPlayableMessage'  =>
                        [
                            'systemErrorCode' => 0,
                            'returnCode'      => 200,
                            'id'              => -1,
                            'paramDTOs'       =>
                                [
                                ],
                            'uiElements'      =>
                                [
                                ],
                        ],
                    'gameMode'                => 'FUN',
                    'gameClientLayoutDTO'     =>
                        [
                            'depotBalanceVisible'      => true,
                            'stakeVisible'             => true,
                            'winVisible'               => true,
                            'coinSizesEnabled'         => true,
                            'lineEnabled'              => true,
                            'maxBetEnabled'            => true,
                            'autoplayEnabled'          => true,
                            'spinEnabled'              => true,
                            'fullscreenEnabled'        => true,
                            'soundEnabled'             => true,
                            'homeEnabled'              => true,
                            'paytableEnabled'          => true,
                            'helpEnabled'              => true,
                            'fastSpinEnabled'          => true,
                            'gambleEnabled'            => true,
                            'riskLadderEnabled'        => true,
                            'collectEnabled'           => true,
                            'responsibleGamingEnabled' => true,
                        ],
                    'gameClientApiVersion'    => '7.0',
                    'openGame'                => false,
                    'openCasinoFreespinGame'  => false,
                ],
        ];

        return response()->json($data);
    }

    /**
     * @param Request $request
     * @param string  $casino
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function gameLaunch(Request $request, string $casino)
    {
        $data = [
            'domainDTO' =>
                [
                    'systemErrorCode'                       => 0,
                    'returnCode'                            => 200,
                    'owner'                                 => 8,
                    'id'                                    => 68671583,
                    'name'                                  => 'whow-fm',
                    'enabled'                               => true,
                    'currency'                              => 'FUM',
                    'jurisdictionForConfigUpdate'           => 'UNREGULATED',
                    'productVariantForConfigUpdate'         => 'EGB',
                    'url'                                   => 'https://edu008-p.edictmaltaservices.com.mt',
                    'gamingTaxAmount'                       => 0,
                    'gamingTaxCurrency'                     => 'EUR',
                    'gamingTaxPeriod'                       => 'monthly',
                    'winLimit'                              =>
                        [
                            'amount'               => 0,
                            'bonusAmount'          => 0,
                            'casinoFreespinAmount' => 0,
                            'currency'             => 'FUM',
                        ],
                    'winLimitWarn'                          =>
                        [
                            'amount'               => 0,
                            'bonusAmount'          => 0,
                            'casinoFreespinAmount' => 0,
                            'currency'             => 'FUM',
                        ],
                    'maximalUnconfirmedPayinLimit'          =>
                        [
                            'amount'               => 0,
                            'bonusAmount'          => 0,
                            'casinoFreespinAmount' => 0,
                            'currency'             => 'FUM',
                        ],
                    'minimalPayinLimit'                     =>
                        [
                            'amount'               => 0,
                            'bonusAmount'          => 0,
                            'casinoFreespinAmount' => 0,
                            'currency'             => 'FUM',
                        ],
                    'minimalPayoutLimit'                    =>
                        [
                            'amount'               => 0,
                            'bonusAmount'          => 0,
                            'casinoFreespinAmount' => 0,
                            'currency'             => 'FUM',
                        ],
                    'heartbeatConfiguration'                =>
                        [
                            'systemErrorCode'            => 0,
                            'returnCode'                 => 200,
                            'heartbeatIntervalInSeconds' => 45,
                        ],
                    'responsibleGamingLinkConfigurationDTO' =>
                        [
                            'systemErrorCode' => 0,
                            'returnCode'      => 200,
                            'active'          => false,
                            'url1'            => '',
                            'icon1'           => '',
                            'url2'            => '',
                            'icon2'           => '',
                        ],
                    'slotSessionLimitConfigurationDTO'      =>
                        [
                            'systemErrorCode'                 => 0,
                            'returnCode'                      => 200,
                            'slotSessionRemainingTimeActive'  => false,
                            'slotSessionRemainingLimitActive' => false,
                        ],
                    'slotSessionStatisticsConfigurationDTO' =>
                        [
                            'systemErrorCode' => 0,
                            'returnCode'      => 200,
                            'active'          => false,
                        ],
                    'regulationPanelClockConfigurationDTO'  =>
                        [
                            'systemErrorCode' => 0,
                            'returnCode'      => 200,
                            'active'          => false,
                        ],
                    'showPayoutLimitExceededMessage'        => false,
                    'defaultLanguage'                       => 'en',
                    'languages'                             =>
                        [
                            'cs',
                            'da',
                            'de',
                            'en',
                            'es',
                            'fi',
                            'fr',
                            'hr',
                            'hu',
                            'it',
                            'nb',
                            'nl',
                            'pl',
                            'pt',
                            'ru',
                            'sr',
                            'sv',
                            'tr',
                        ],
                    'ipWhitelist'                           =>
                        [
                        ],
                    'countryBlackList'                      =>
                        [
                        ],
                    'paymentMethods'                        =>
                        [
                        ],
                    'affiliateServer'                       =>
                        [
                            'systemErrorCode' => 0,
                            'returnCode'      => 200,
                            'id'              => -1,
                            'productName'     => '',
                            'productVersion'  => '',
                            'serverURL'       => '',
                            'internalURL'     => '',
                            'userName'        => '',
                            'password'        => '',
                            'active'          => false,
                        ],
                    'compPointExchangeRate'                 => 1,
                    'winnerTrackingThreshold'               =>
                        [
                            'amount'               => 300000,
                            'bonusAmount'          => 0,
                            'casinoFreespinAmount' => 0,
                            'currency'             => 'FUM',
                        ],
                    'availableTimeZones'                    =>
                        [

                            [
                                'id'            => 'Africa/Casablanca',
                                'offsetMinutes' => 60,
                            ],

                            [
                                'id'            => 'Europe/London',
                                'offsetMinutes' => 0,
                            ],
                            [
                                'id'            => 'Europe/Amsterdam',
                                'offsetMinutes' => 60,
                            ],
                            [
                                'id'            => 'Europe/Belgrade',
                                'offsetMinutes' => 60,
                            ],
                            [
                                'id'            => 'Europe/Brussels',
                                'offsetMinutes' => 60,
                            ],

                            [
                                'id'            => 'Europe/Sarajevo',
                                'offsetMinutes' => 60,
                            ],

                            [
                                'id'            => 'Africa/Algiers',
                                'offsetMinutes' => 60,
                            ],

                            [
                                'id'            => 'Europe/Athens',
                                'offsetMinutes' => 120,
                            ],

                            [
                                'id'            => 'Europe/Bucharest',
                                'offsetMinutes' => 120,
                            ],

                            [
                                'id'            => 'Africa/Cairo',
                                'offsetMinutes' => 120,
                            ],

                            [
                                'id'            => 'Africa/Harare',
                                'offsetMinutes' => 120,
                            ],

                            [
                                'id'            => 'Europe/Helsinki',
                                'offsetMinutes' => 120,
                            ],

                            [
                                'id'            => 'Israel',
                                'offsetMinutes' => 120,
                            ],

                            [
                                'id'            => 'Asia/Baghdad',
                                'offsetMinutes' => 180,
                            ],

                            [
                                'id'            => 'Asia/Kuwait',
                                'offsetMinutes' => 180,
                            ],

                            [
                                'id'            => 'Europe/Moscow',
                                'offsetMinutes' => 180,
                            ],

                            [
                                'id'            => 'Africa/Nairobi',
                                'offsetMinutes' => 180,
                            ],

                            [
                                'id'            => 'Asia/Tehran',
                                'offsetMinutes' => 210,
                            ],

                            [
                                'id'            => 'Asia/Muscat',
                                'offsetMinutes' => 240,
                            ],

                            [
                                'id'            => 'Asia/Baku',
                                'offsetMinutes' => 240,
                            ],

                            [
                                'id'            => 'Asia/Kabul',
                                'offsetMinutes' => 270,
                            ],

                            [
                                'id'            => 'Asia/Yekaterinburg',
                                'offsetMinutes' => 300,
                            ],

                            [
                                'id'            => 'Asia/Karachi',
                                'offsetMinutes' => 300,
                            ],

                            [
                                'id'            => 'Asia/Calcutta',
                                'offsetMinutes' => 330,
                            ],

                            [
                                'id'            => 'Asia/Katmandu',
                                'offsetMinutes' => 345,
                            ],

                            [
                                'id'            => 'Asia/Almaty',
                                'offsetMinutes' => 360,
                            ],

                            [
                                'id'            => 'Asia/Dhaka',
                                'offsetMinutes' => 360,
                            ],

                            [
                                'id'            => 'Etc/GMT+6',
                                'offsetMinutes' => -360,
                            ],

                            [
                                'id'            => 'Asia/Rangoon',
                                'offsetMinutes' => 390,
                            ],

                            [
                                'id'            => 'Asia/Bangkok',
                                'offsetMinutes' => 420,
                            ],

                            [
                                'id'            => 'Asia/Krasnoyarsk',
                                'offsetMinutes' => 420,
                            ],

                            [
                                'id'            => 'Asia/Chongqing',
                                'offsetMinutes' => 480,
                            ],

                            [
                                'id'            => 'Asia/Irkutsk',
                                'offsetMinutes' => 480,
                            ],

                            [
                                'id'            => 'Asia/Kuala_Lumpur',
                                'offsetMinutes' => 480,
                            ],

                            [
                                'id'            => 'Australia/Perth',
                                'offsetMinutes' => 480,
                            ],

                            [
                                'id'            => 'Asia/Taipei',
                                'offsetMinutes' => 480,
                            ],

                            [
                                'id'            => 'Asia/Tokyo',
                                'offsetMinutes' => 540,
                            ],

                            [
                                'id'            => 'Asia/Seoul',
                                'offsetMinutes' => 540,
                            ],

                            [
                                'id'            => 'Asia/Yakutsk',
                                'offsetMinutes' => 540,
                            ],

                            [
                                'id'            => 'Australia/Adelaide',
                                'offsetMinutes' => 630,
                            ],

                            [
                                'id'            => 'Australia/Darwin',
                                'offsetMinutes' => 570,
                            ],

                            [
                                'id'            => 'Australia/Brisbane',
                                'offsetMinutes' => 600,
                            ],

                            [
                                'id'            => 'Australia/Melbourne',
                                'offsetMinutes' => 660,
                            ],

                            [
                                'id'            => 'Pacific/Guam',
                                'offsetMinutes' => 600,
                            ],

                            [
                                'id'            => 'Australia/Hobart',
                                'offsetMinutes' => 660,
                            ],

                            [
                                'id'            => 'Asia/Vladivostok',
                                'offsetMinutes' => 600,
                            ],

                            [
                                'id'            => 'Asia/Magadan',
                                'offsetMinutes' => 660,
                            ],

                            [
                                'id'            => 'Pacific/Auckland',
                                'offsetMinutes' => 780,
                            ],

                            [
                                'id'            => 'Pacific/Fiji',
                                'offsetMinutes' => 720,
                            ],

                            [
                                'id'            => 'Etc/GMT-13',
                                'offsetMinutes' => 780,
                            ],

                            [
                                'id'            => 'Atlantic/Azores',
                                'offsetMinutes' => -60,
                            ],

                            [
                                'id'            => 'Etc/GMT+2',
                                'offsetMinutes' => -120,
                            ],

                            [
                                'id'            => 'Brazil/East',
                                'offsetMinutes' => -180,
                            ],

                            [
                                'id'            => 'America/Buenos_Aires',
                                'offsetMinutes' => -180,
                            ],

                            [
                                'id'            => 'Etc/GMT+3',
                                'offsetMinutes' => -180,
                            ],

                            [
                                'id'            => 'Canada/Newfoundland',
                                'offsetMinutes' => -210,
                            ],

                            [
                                'id'            => 'Canada/Atlantic',
                                'offsetMinutes' => -240,
                            ],

                            [
                                'id'            => 'America/Caracas',
                                'offsetMinutes' => -240,
                            ],

                            [
                                'id'            => 'America/Santiago',
                                'offsetMinutes' => -180,
                            ],

                            [
                                'id'            => 'America/Bogota',
                                'offsetMinutes' => -300,
                            ],

                            [
                                'id'            => 'America/Indiana/Indianapolis',
                                'offsetMinutes' => -300,
                            ],

                            [
                                'id'            => 'US/Central',
                                'offsetMinutes' => -360,
                            ],

                            [
                                'id'            => 'America/Mexico_City',
                                'offsetMinutes' => -360,
                            ],

                            [
                                'id'            => 'Canada/Saskatchewan',
                                'offsetMinutes' => -360,
                            ],

                            [
                                'id'            => 'US/Arizona',
                                'offsetMinutes' => -420,
                            ],

                            [
                                'id'            => 'America/Chihuahua',
                                'offsetMinutes' => -420,
                            ],

                            [
                                'id'            => 'US/Alaska',
                                'offsetMinutes' => -540,
                            ],

                            [
                                'id'            => 'US/Hawaii',
                                'offsetMinutes' => -600,
                            ],

                            [
                                'id'            => 'Pacific/Midway',
                                'offsetMinutes' => -660,
                            ],

                            [
                                'id'            => 'Etc/GMT+12',
                                'offsetMinutes' => -720,
                            ],
                        ],
                    'currencyDisplayInfo'                   =>
                        [
                            'currencyCode'     => 'FUM',
                            'currencySymbol'   => ' ',
                            'printedBefore'    => true,
                            'fractionDigits'   => 0,
                            'decimalSeparator' => '.',
                            'groupSeparator'   => ',',
                        ],
                    'defaultDateTimeFormats'                =>
                        [

                            [
                                'language'   => 'de',
                                'dateFormat' => 'dd.mm.yy',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'ru',
                                'dateFormat' => 'dd.mm.yy',
                                'timeFormat' => 'H:mm',
                            ],

                            [
                                'language'   => 'sv',
                                'dateFormat' => 'yyyy-mm-dd',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'fi',
                                'dateFormat' => 'd.m.yyyy',
                                'timeFormat' => 'H:mm',
                            ],

                            [
                                'language'   => 'pt',
                                'dateFormat' => 'dd-mm-yyyy',
                                'timeFormat' => 'H:mm',
                            ],

                            [
                                'language'   => 'en',
                                'dateFormat' => 'm/d/yy',
                                'timeFormat' => 'h:mm',
                            ],

                            [
                                'language'   => 'hr',
                                'dateFormat' => 'yyyy.mm.dd',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'it',
                                'dateFormat' => 'dd/mm/yy',
                                'timeFormat' => 'H.mm',
                            ],

                            [
                                'language'   => 'fr',
                                'dateFormat' => 'dd/mm/yy',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'hu',
                                'dateFormat' => 'yyyy.mm.dd.',
                                'timeFormat' => 'H:mm',
                            ],

                            [
                                'language'   => 'es',
                                'dateFormat' => 'd/mm/yy',
                                'timeFormat' => 'H:mm',
                            ],

                            [
                                'language'   => 'cs',
                                'dateFormat' => 'd.m.yy',
                                'timeFormat' => 'H:mm',
                            ],

                            [
                                'language'   => 'nb',
                                'dateFormat' => 'dd.mm.yy',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'pl',
                                'dateFormat' => 'yy-mm-dd',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'da',
                                'dateFormat' => 'dd-mm-yy',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'tr',
                                'dateFormat' => 'dd.mm.yyyy',
                                'timeFormat' => 'HH:mm',
                            ],

                            [
                                'language'   => 'nl',
                                'dateFormat' => 'd-m-yy',
                                'timeFormat' => 'H:mm',
                            ],

                            [
                                'language'   => 'sr',
                                'dateFormat' => 'd.m.yy.',
                                'timeFormat' => 'HH.mm',
                            ],
                        ],
                ],
        ];

        return response()->json($data);
    }

    /**
     * @param Request $request
     * @param string  $casino
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function walletType(Request $request, string $casino)
    {
        return response()->json([
            'value' => 'EGB_WHOW',
        ]);
    }

    public function gameSessionInit(Request $request)
    {
        return response()->json(['de.edict.eoc.gaming.comm.ResponseDTO' =>[]]);
    }
}
