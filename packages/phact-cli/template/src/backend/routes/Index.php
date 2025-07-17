<?php

use Phact\Phact\Route;
use Phact\Phact\PhactResponse;

Route::get("/", function (){
    return new PhactResponse("Index", [
        "name" => "Phact"
    ]);
});
