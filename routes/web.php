<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('home');
});

Route::post('/', 'CasinoController@start');


Route::group(['prefix' => 'services/gamelaunch/v1'], function () {

    Route::group(['prefix' => 'casinos/{casino}'], function () {
        Route::get('/', 'CasinoController@gameLaunch');
        Route::get('walletType', 'CasinoController@walletType');
    });

    Route::get('gateway/casinos/{casino}/launcherData/players/{player}/{type}/templates/{t1}/{t2}/{t3}','CasinoController@launchData');

});

Route::group(['prefix' => 'services/gaming/5/v2/gateway'], function (){
    Route::post('gamesession/init','CasinoController@gameSessionInit');
    Route::any('casinos/{casino}/heartbeat','CommandsController@heartBeat');
    Route::post('casinos/{casino}/v2/templates/{t1}/{t2}/commands/','CommandsController@command');
    Route::post('casinos/{casino}/v2/templates/{t1}/{t2}/commands/start','CommandsController@start');
    Route::post('casinos/{casino}/v2/templates/{t1}/{t2}/commands/commands','CommandsController@commands');
});
