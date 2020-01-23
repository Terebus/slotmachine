<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CommandsController extends Controller
{
    public function start(Request $request)
    {
        $data = [
            'de.edict.eoc.gaming.comm.JoinSessionResponseDTO' => [
                'gameMode'        => 'FUN',
                'gameSessionUuid' => implode('-', sscanf(md5(uniqid('test') . time()), '%08s%04s%04s%04s%12s')),
                'depot'           => [
                    'balance'      => 250000000,
                    'limitBalance' => 250000000,
                ],
                'gameSpecs'       => [
                    'minimalStake' => 1000,
                    'maximalStake' => 5000000,
                ],
                'playerSettings'  => [
                ],
            ],
        ];

        return response()->json($data);
    }

    public function command(Request $request)
    {
    }

    public function heartBeat(Request $request)
    {
        return response()->json([
            'de.edict.eoc.gaming.comm.HeartbeatResponseDTO' => [
            ],
        ]);
    }

    public function commands(Request $request)
    {
        $JSON = json_decode($request->getContent(), true);

        if ( ! $JSON) {
            return response()->json(['error' => 'Bad command']);
        }

        $gameData = $JSON['de.edict.eoc.gaming.comm.GameSessionRequestDTO']['gameData'];

        if (is_array($gameData) && isset($gameData['gameActionId']) && $gameData['gameActionId'] === 'INIT') {
            $data = $this->gameInit($request);
        } else {
            $gameAction = json_decode($gameData, true)['gameActionId'];
            switch ($gameAction) {
                case 'PLAY';
                    $data = $this->play($request);
                    break;
                case 'FINISH_GAME':
                    $data = $this->finish($request);
                    break;
                default:
                    $data = ['error' => 'Unknown game action'];
            }

        }

        return response()->json($data);
    }

    private function play(Request $request)
    {
        $matrixes = [
            [
                [
                    mt_rand(1, 7),
                    1,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    1,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    1,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    1,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    1,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
            ],
            [
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    2,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    2,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    2,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    2,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    2,
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
            ],
            [
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
                [
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                    mt_rand(1, 7),
                ],
            ],
        ];

        $matrix   = $matrixes[mt_rand(0, count($matrixes) - 1)];
        $winnings = $this->isWon($matrix);

        $gameData = [
            'mainGameResult'      => [
                'winnings'           => $winnings
                /* [
                     'wagerPositionId' => 5,
                     'winFactor'       => 100,
                     'winSum'          => 12500000,
                     'wagerId'         => 5,
                     'winExtensions'   => [
                     ],
                     'items'           => [
                         [
                             'point'  => [
                                 'x' => 1,
                                 'y' => 1,
                             ],
                             'symbol' => 7,
                         ],
                         [
                             'point'  => [
                                 'x' => 2,
                                 'y' => 1,
                             ],
                             'symbol' => 7,
                         ],
                         [
                             'point'  => [
                                 'x' => 3,
                                 'y' => 1,
                             ],
                             'symbol' => 7,
                         ],
                         [
                             'point'  => [
                                 'x' => 4,
                                 'y' => 1,
                             ],
                             'symbol' => 7,
                         ],
                     ],
                     'highlight'       => [
                         'payGroupMemberId' => 1,
                         'occurrence'       => 3,
                     ],
                     'lid'             => 0,
                     'eid'             => 0,
                 ],*/
                /*   [
                       'wagerPositionId' => 5,
                       'winFactor'       => 10,
                       'winSum'          => 5000000,
                       'wagerId'         => 5,
                       'winExtensions'   => [
                       ],
                       'items'           => [
                           [
                               'point'  => [
                                   'x' => 1,
                                   'y' => 1,
                               ],
                               'symbol' => 7,
                           ],
                           [
                               'point'  => [
                                   'x' => 2,
                                   'y' => 0,
                               ],
                               'symbol' => 7,
                           ],
                           [
                               'point'  => [
                                   'x' => 3,
                                   'y' => 1,
                               ],
                               'symbol' => 7,
                           ],
                       ],
                       'highlight'       => [
                           'payGroupMemberId' => 7,
                           'occurrence'       => 3,
                       ],
                       'lid'             => 5,
                       'eid'             => 2,
                   ],
                   [
                       'wagerPositionId' => 6,
                       'winFactor'       => 10,
                       'winSum'          => 5000000,
                       'wagerId'         => 6,
                       'winExtensions'   => [
                       ],
                       'items'           => [
                           [
                               'point'  => [
                                   'x' => 1,
                                   'y' => 0,
                               ],
                               'symbol' => 7,
                           ],
                           [
                               'point'  => [
                                   'x' => 2,
                                   'y' => 1,
                               ],
                               'symbol' => 7,
                           ],
                           [
                               'point'  => [
                                   'x' => 3,
                                   'y' => 2,
                               ],
                               'symbol' => 7,
                           ],
                       ],
                       'highlight'       => [
                           'payGroupMemberId' => 7,
                           'occurrence'       => 3,
                       ],
                       'lid'             => 6,
                       'eid'             => 2,
                   ],
                   [
                       'wagerPositionId' => 10,
                       'winFactor'       => 25,
                       'winSum'          => 12500000,
                       'wagerId'         => 10,
                       'winExtensions'   => [
                       ],
                       'items'           => [
                           [
                               'point'  => [
                                   'x' => 1,
                                   'y' => 1,
                               ],
                               'symbol' => 7,
                           ],
                           [
                               'point'  => [
                                   'x' => 2,
                                   'y' => 1,
                               ],
                               'symbol' => 7,
                           ],
                           [
                               'point'  => [
                                   'x' => 3,
                                   'y' => 1,
                               ],
                               'symbol' => 7,
                           ],
                           [
                               'point'  => [
                                   'x' => 4,
                                   'y' => 0,
                               ],
                               'symbol' => 7,
                           ],
                       ],
                       'highlight'       => [
                           'payGroupMemberId' => 7,
                           'occurrence'       => 4,
                       ],
                       'lid'             => 10,
                       'eid'             => 2,
                   ],*/
                ,
                'creatorName'        => 'MAIN_GAME',
                'parameters'         => [
                ],
                'childGameResult'    => null,
                'freeGameRound'      => 0,
                'freeGamesTotal'     => 0,
                'multiplier'         => 1,
                'resultGeneratorKey' => [
                    'keyName' => 'SLOT_MACHINE',
                ],
                'reels'              => [
                    [
                        'visibleSymbolCount' => 5,
                        'swingOffSize'       => 1,
                        'symbols'            => $matrix[0],
                    ],
                    [
                        'visibleSymbolCount' => 5,
                        'swingOffSize'       => 1,
                        'symbols'            => $matrix[1],
                    ],
                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => $matrix[2],
                    ],
                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => $matrix[3],
                    ],
                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => $matrix[4],
                    ],
                ],
            ],
            'nextGameActions'     => [
                [
                    'id'             => empty($winnings)?'PLAY':'FINISH_GAME',
                    'minTotalWager'  => 0,
                    'maxTotalWager'  => 0,
                    'wagerPositions' => [
                    ],
                ],
            ],
            'accounting'          => [
                'debit'      => 5000000,
                'credit'     => 35000000,
                'debitType'  => 'WAGER',
                'creditType' => 'WIN',
            ],
            'uncommittedWinSum'   => 0,
            'lastWagerSum'        => 0,
            'addOnGameInitResult' => null,
            'addOnGameResult'     => null,
            'responseType'        => 'ACTION',
            'nextGameFlowName'    => 'MAIN_GAME',
        ];

        $data = [
            'de.edict.eoc.gaming.comm.GameClientActionResponseDTO' => [
                'coreData' => [
                    'depot'          => [
                        'balance'      => 92500000,
                        'limitBalance' => 92500000,
                    ],
                    'isGameFinished' => false,
                ],
                'gameData' => json_encode($gameData),
            ],
        ];

        return $data;
    }

    private function gameInit(Request $request)
    {
        $gameData = [
            'mainGameResult'      => [
                'winnings'           => [
                ],
                'creatorName'        => 'MAIN_GAME',
                'parameters'         => [
                    'CLIENT_SETTINGS' => '{"coin":2000,"countOfActiveWagerPositions":10,"custom":null}',
                ],
                'childGameResult'    => null,
                'freeGameRound'      => 0,
                'freeGamesTotal'     => 0,
                'multiplier'         => 1,
                'resultGeneratorKey' => [
                    'keyName' => 'SLOT_MACHINE',
                ],
                'reels'              => [

                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => [
                            1,
                            1,
                            1,
                            4,
                        ],
                    ],

                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => [
                            6,
                            3,
                            3,
                            3,
                        ],
                    ],

                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => [
                            3,
                            3,
                            3,
                            5,
                        ],
                    ],

                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => [
                            4,
                            4,
                            4,
                            5,
                        ],
                    ],

                    [
                        'visibleSymbolCount' => 3,
                        'swingOffSize'       => 1,
                        'symbols'            => [
                            4,
                            2,
                            2,
                            2,
                        ],
                    ],
                ],
            ],
            'nextGameActions'     => [

                [
                    'id'             => 'PLAY',
                    'minTotalWager'  => 1000,
                    'maxTotalWager'  => 5000000,
                    'wagerPositions' => [

                        [
                            'id'          => 1,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 2,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 3,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 4,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 5,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 6,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 7,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 8,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 9,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],

                        [
                            'id'          => 10,
                            'wagerBounds' => [
                                'possibleWagers' => [
                                    2000,
                                    10000,
                                    20000,
                                    50000,
                                    100000,
                                    200000,
                                    100,
                                    500,
                                    500000,
                                    200,
                                    1000,
                                    5000,
                                ],
                                'minWager'       => 100,
                                'maxWager'       => 500000,
                                'wagerStepType'  => 'FIXED',
                            ],
                        ],
                    ],
                ],
            ],
            'accounting'          => [
                'debit'      => 0,
                'credit'     => 0,
                'debitType'  => 'WAGER',
                'creditType' => 'WIN',
            ],
            'uncommittedWinSum'   => 0,
            'lastWagerSum'        => 0,
            'addOnGameInitResult' => null,
            'addOnGameResult'     => null,
            'responseType'        => 'INIT',
            'payTable'            => [
                'groups' => [

                    [
                        'members' => [
                            7,
                            6,
                        ],
                        'items'   => [

                            [
                                'winFactor' => 10,
                                'occur'     => 3,
                            ],

                            [
                                'winFactor' => 25,
                                'occur'     => 4,
                            ],

                            [
                                'winFactor' => 150,
                                'occur'     => 5,
                            ],
                        ],
                    ],

                    [
                        'members' => [
                            3,
                            4,
                        ],
                        'items'   => [

                            [
                                'winFactor' => 15,
                                'occur'     => 3,
                            ],

                            [
                                'winFactor' => 50,
                                'occur'     => 4,
                            ],

                            [
                                'winFactor' => 200,
                                'occur'     => 5,
                            ],
                        ],
                    ],

                    [
                        'members' => [
                            5,
                        ],
                        'items'   => [

                            [
                                'winFactor' => 2,
                                'occur'     => 3,
                            ],

                            [
                                'winFactor' => 10,
                                'occur'     => 4,
                            ],

                            [
                                'winFactor' => 50,
                                'occur'     => 5,
                            ],
                        ],
                    ],

                    [
                        'members' => [
                            0,
                            2,
                        ],
                        'items'   => [

                            [
                                'winFactor' => 30,
                                'occur'     => 3,
                            ],

                            [
                                'winFactor' => 150,
                                'occur'     => 4,
                            ],

                            [
                                'winFactor' => 500,
                                'occur'     => 5,
                            ],
                        ],
                    ],

                    [
                        'members' => [
                            1,
                        ],
                        'items'   => [

                            [
                                'winFactor' => 50,
                                'occur'     => 3,
                            ],

                            [
                                'winFactor' => 500,
                                'occur'     => 4,
                            ],

                            [
                                'winFactor' => 5000,
                                'occur'     => 5,
                            ],
                        ],
                    ],
                ],
            ],
            'wagerPositionSets'   => [

                [
                    'wagerPositionIds' => [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                    ],
                    'type'             => 'FIXED',
                    'wagerBounds'      => null,
                ],
            ],
            'coins'               => [
                1000,
                2000,
                5000,
                10000,
                20000,
                50000,
                100000,
                200000,
                500000,
                1000000,
                2000000,
                5000000,
            ],
            'translations'        => [
                'ButtonCaption_RISK_BLACKRED_BLACK'  => 'Gamble on Black',
                'ButtonCaption_RISK_BLACKRED_CHOICE' => 'Gamble Card',
                'ButtonCaption_RISK_BLACKRED_RED'    => 'Gamble on Red',
                'deactivate_autoplay'                => 'STOP',
                'sound'                              => 'Sound',
                'shortcutExplanation'                => 'M: x1000000 G: x1000M',
                'POST_STATE_MOVED'                   => 'moved',
                'autostart'                          => 'AUTO START',
                'deactivate_turbospin'               => 'Deactivate with <icon>',
                'POST_STATE_LOWERED'                 => 'lowered',
                'LINES'                              => 'LINES',
                'POST_STATE_CANCELED_BY_BANK'        => 'cancelled',
                'at_next_freegames'                  => 'at win of freegames',
                'activate_sound'                     => 'Activate the Sound',
                'POST_STATE_LOST'                    => 'not won',
                'bet'                                => 'BET',
                'at_win_available'                   => 'At win available:',
                'at_max_total_loss_of'               => 'at DEPOSIT below or equal',
                'ButtonCaption_PLAY'                 => 'Start',
                'BLACKRED'                           => 'Gamble Black Red',
                'shortThousand'                      => 'k',
                'at_win_of_freegames'                => 'at win of freegames',
                'ButtonCaption_RISK_LADDER_CHOICE'   => 'Gamble Ladder',
                'ButtonCaption_RISK_DIVIDE'          => 'Collect Half',
                'openGameCloseConfirmation.body'     => 'Game is not finished yet. Do you want to close the game and continue later?',
                'at_max_total_win_of'                => 'at DEPOSIT above or equal',
                'Number.Delim.Float'                 => '.',
                'at_min_win_of'                      => 'at win of at least',
                'set_the_bet'                        => 'Bet',
                'ButtonCaption_RaiseBetsToMaxBtn'    => 'Max Bet',
                'set_the_amount_of_autospins'        => 'Number of Autostarts',
                'set_the_bet_per_line'               => 'Bet per Line',
                'ButtonCaption_COLLECT'              => 'Collect Win',
                'GameMeterCaption_DEPOT'             => 'DEPOSIT',
                'TOTALBET'                           => 'BET',
                'POST_STATE_WON'                     => 'won',
                'at_total_loss_of'                   => 'at loss above or equal',
                'left_handed'                        => 'Left',
                'POST_STATE_PARTIAL_WIN'             => 'partial win',
                'ButtonCaption_RISK'                 => 'Gamble',
                'reentering_freegames_message'       => 'Welcome back! All winnings have been booked to DEPOT.',
                'BETS_PER_LINE'                      => 'PER LINE',
                'ButtonCaption_FINISH_GAME'          => 'Collect Win',
                'shortBillion'                       => 'G',
                'big_win'                            => 'WIN',
                'GameMeterCaption_BETS'              => 'BETS',
                'button_yes'                         => 'yes',
                'autospins'                          => 'Autostarts',
                'ButtonCaption_ADP_PLAY'             => 'Start',
                'LADDER'                             => 'Gamble Ladder',
                'POST_STATE_IN_PLAY'                 => 'in play',
                'BlackRedPeakCaption'                => 'GAMBLE LIMIT',
                'BlackRedWinCaption'                 => 'GAMBLE WIN',
                'LadderPlayOffCaption'               => 'Playoff',
                'set_the_amount_of_lines'            => 'Number of Lines',
                'GameMeterCaption_WINS'              => 'WINS',
                'POST_STATE_PLACING'                 => 'placing',
                'LINE'                               => 'LINE',
                'reentering_freegames_title'         => 'Welcome back!',
                'POST_STATE_PLACED'                  => 'placed',
                'at_next_win'                        => 'at next win',
                'button_no'                          => 'no',
                'POST_STATE_CANCELED_BY_PLAYER'      => 'cancelled',
                'POST_STATE_RAISED'                  => 'raised',
                'initializing'                       => 'Initializing',
                'is_mandatory'                       => '*) Please fill in all required entry fields.',
                'paytable'                           => 'Paytable',
                'right_handed'                       => 'Right',
                'shortMillion'                       => 'M',
                'help'                               => 'Help',
                'POST_STATE_SUSPENDED'               => 'suspended',
                'bet_per_line'                       => 'PER LINE',
                'BlackRedRiskCaption'                => 'GAMBLE BET',
                'activate_turbospin'                 => 'Activate Quick Spin?',
                'POST_STATE_SURRENDERED'             => 'surrendered',
            ],
            'locale'              => 'en',
            'nextGameFlowName'    => 'MAIN_GAME',
        ];
        $data     = [
            'de.edict.eoc.gaming.comm.GameClientActionResponseDTO' => [
                'coreData' => [
                    'depot'          => [
                        'balance'      => mt_rand(1, 250000000),
                        'limitBalance' => 250000000,
                    ],
                    'isGameFinished' => true,
                ],
                'gameData' => json_encode($gameData),
            ],
        ];

        return $data;
    }

    private function finish(Request $request)
    {
        $gameData = [
            'mainGameResult'      =>
                [
                    'winnings'           =>
                        [
                            /*   0 =>
                                   [
                                       'wagerPositionId' => 3,
                                       'winFactor'       => 15,
                                       'winSum'          => 3000,
                                       'wagerId'         => 3,
                                       'winExtensions'   =>
                                           [
                                           ],
                                       'items'           =>
                                           [
                                               0 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 1,
                                                               'y' => 2,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                               1 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 2,
                                                               'y' => 2,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                               2 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 3,
                                                               'y' => 2,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                           ],
                                       'highlight'       =>
                                           [
                                               'payGroupMemberId' => 4,
                                               'occurrence'       => 3,
                                           ],
                                       'lid'             => 3,
                                       'eid'             => 2,
                                   ],
                               1 =>
                                   [
                                       'wagerPositionId' => 7,
                                       'winFactor'       => 15,
                                       'winSum'          => 3000,
                                       'wagerId'         => 7,
                                       'winExtensions'   =>
                                           [
                                           ],
                                       'items'           =>
                                           [
                                               0 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 1,
                                                               'y' => 2,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                               1 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 2,
                                                               'y' => 1,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                               2 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 3,
                                                               'y' => 0,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                           ],
                                       'highlight'       =>
                                           [
                                               'payGroupMemberId' => 4,
                                               'occurrence'       => 3,
                                           ],
                                       'lid'             => 7,
                                       'eid'             => 2,
                                   ],
                               2 =>
                                   [
                                       'wagerPositionId' => 9,
                                       'winFactor'       => 50,
                                       'winSum'          => 10000,
                                       'wagerId'         => 9,
                                       'winExtensions'   =>
                                           [
                                           ],
                                       'items'           =>
                                           [
                                               0 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 0,
                                                               'y' => 1,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                               1 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 1,
                                                               'y' => 2,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                               2 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 2,
                                                               'y' => 2,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                               3 =>
                                                   [
                                                       'point'  =>
                                                           [
                                                               'x' => 3,
                                                               'y' => 2,
                                                           ],
                                                       'symbol' => 4,
                                                   ],
                                           ],
                                       'highlight'       =>
                                           [
                                               'payGroupMemberId' => 4,
                                               'occurrence'       => 4,
                                           ],
                                       'lid'             => 9,
                                       'eid'             => 2,
                                   ],*/
                        ],
                    'creatorName'        => 'MAIN_GAME',
                    'parameters'         =>
                        [
                        ],
                    'childGameResult'    => null,
                    'freeGameRound'      => 0,
                    'freeGamesTotal'     => 0,
                    'multiplier'         => 1,
                    'resultGeneratorKey' =>
                        [
                            'keyName' => 'SLOT_MACHINE',
                        ],
                    'reels'              =>
                        [
                            0 =>
                                [
                                    'visibleSymbolCount' => 3,
                                    'swingOffSize'       => 1,
                                    'symbols'            =>
                                        [
                                            0 => 4,
                                            1 => 4,
                                            2 => 4,
                                            3 => 1,
                                            4 => 1,
                                            5 => 1,
                                        ],
                                ],
                            1 =>
                                [
                                    'visibleSymbolCount' => 3,
                                    'swingOffSize'       => 1,
                                    'symbols'            =>
                                        [
                                            0 => 0,
                                            1 => 0,
                                            2 => 0,
                                            3 => 4,
                                            4 => 4,
                                            5 => 4,
                                            6 => 4,
                                            7 => 4,
                                        ],
                                ],
                            2 =>
                                [
                                    'visibleSymbolCount' => 3,
                                    'swingOffSize'       => 1,
                                    'symbols'            =>
                                        [
                                            0 => 6,
                                            1 => 5,
                                            2 => 4,
                                            3 => 4,
                                            4 => 4,
                                            5 => 6,
                                            6 => 6,
                                            7 => 6,
                                            8 => 0,
                                            9 => 0,
                                        ],
                                ],
                            3 =>
                                [
                                    'visibleSymbolCount' => 3,
                                    'swingOffSize'       => 1,
                                    'symbols'            =>
                                        [
                                            0  => 7,
                                            1  => 4,
                                            2  => 4,
                                            3  => 4,
                                            4  => 4,
                                            5  => 6,
                                            6  => 6,
                                            7  => 6,
                                            8  => 6,
                                            9  => 5,
                                            10 => 3,
                                            11 => 3,
                                        ],
                                ],
                            4 =>
                                [
                                    'visibleSymbolCount' => 3,
                                    'swingOffSize'       => 1,
                                    'symbols'            =>
                                        [
                                            0  => 0,
                                            1  => 7,
                                            2  => 7,
                                            3  => 7,
                                            4  => 7,
                                            5  => 2,
                                            6  => 2,
                                            7  => 2,
                                            8  => 5,
                                            9  => 3,
                                            10 => 3,
                                            11 => 3,
                                            12 => 4,
                                            13 => 4,
                                        ],
                                ],
                        ],
                ],
            'nextGameActions'     =>
                [
                    0 =>
                        [
                            'id'             => 'PLAY',
                            'minTotalWager'  => 1000,
                            'maxTotalWager'  => 5000000,
                            'wagerPositions' =>
                                [
                                    0 =>
                                        [
                                            'id'          => 1,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    1 =>
                                        [
                                            'id'          => 2,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    2 =>
                                        [
                                            'id'          => 3,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    3 =>
                                        [
                                            'id'          => 4,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    4 =>
                                        [
                                            'id'          => 5,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    5 =>
                                        [
                                            'id'          => 6,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    6 =>
                                        [
                                            'id'          => 7,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    7 =>
                                        [
                                            'id'          => 8,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    8 =>
                                        [
                                            'id'          => 9,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                    9 =>
                                        [
                                            'id'          => 10,
                                            'wagerBounds' =>
                                                [
                                                    'possibleWagers' =>
                                                        [
                                                            0  => 2000,
                                                            1  => 10000,
                                                            2  => 20000,
                                                            3  => 50000,
                                                            4  => 100000,
                                                            5  => 200000,
                                                            6  => 100,
                                                            7  => 500,
                                                            8  => 500000,
                                                            9  => 200,
                                                            10 => 1000,
                                                            11 => 5000,
                                                        ],
                                                    'minWager'       => 100,
                                                    'maxWager'       => 500000,
                                                    'wagerStepType'  => 'FIXED',
                                                ],
                                        ],
                                ],
                        ],
                ],
            'accounting'          =>
                [
                    'debit'      => 0,
                    'credit'     => 16000,
                    'debitType'  => 'WAGER',
                    'creditType' => 'PAYOUT',
                ],
            'uncommittedWinSum'   => 0,
            'lastWagerSum'        => 0,
            'addOnGameInitResult' => null,
            'addOnGameResult'     => null,
            'responseType'        => 'ACTION',
            'nextGameFlowName'    => 'MAIN_GAME',
        ];

        $data = [
            'de.edict.eoc.gaming.comm.GameClientActionResponseDTO' =>
                [
                    'coreData' =>
                        [
                            'depot'          =>
                                [
                                    'balance'      => 250008000,
                                    'limitBalance' => 250008000,
                                ],
                            'isGameFinished' => true,
                        ],
                    'gameData' => json_encode($gameData),
                ],
        ];

        return $data;

    }

    private function isWon(array $matrix)
    {
        $rale1 = array_slice($matrix[0], 1, 3);
        $rale2 = array_slice($matrix[1], 1, 3);
        $rale3 = array_slice($matrix[2], 1, 3);
        $rale4 = array_slice($matrix[3], 1, 3);
        $rale5 = array_slice($matrix[4], 1, 3);

        $winnings = [];

        for ($i = 0; $i <= 2; $i++) {
            if ($rale2[$i] === $rale1[$i]
                && $rale3[$i] === $rale1[$i]
                && $rale3[$i] === $rale1[$i]
                && $rale5[$i] === $rale1[$i]
            ) {
                $winnings[] = [
                    'wagerPositionId' => $i,
                    'winFactor'       => 100,
                    'winSum'          => mt_rand(100, 100000),
                    'wagerId'         => $i + 1,
                    'winExtensions'   => [
                    ],
                    'items'           => [
                        [
                            'point'  => [
                                'x' => 0,
                                'y' => $i,
                            ],
                            'symbol' => $rale1[$i],
                        ],
                        [
                            'point'  => [
                                'x' => 1,
                                'y' => $i,
                            ],
                            'symbol' => $rale1[$i],
                        ],
                        [
                            'point'  => [
                                'x' => 2,
                                'y' => $i,
                            ],
                            'symbol' => $rale1[$i],
                        ],
                        [
                            'point'  => [
                                'x' => 3,
                                'y' => $i,
                            ],
                            'symbol' => $rale1[$i],
                        ],
                        [
                            'point'  => [
                                'x' => 4,
                                'y' => $i,
                            ],
                            'symbol' => $rale1[$i],
                        ],
                    ],
                    'highlight'       => [
                        'payGroupMemberId' => 1,
                        'occurrence'       => 4,
                    ],
                    'lid'             => $i === 1 ? 1 : ($i === 0 ? 2 : 3),
                    'eid'             => $i === 1 ? 1 : ($i === 0 ? 2 : 3),
                ];
            }
        }

        return $winnings;
    }
}
