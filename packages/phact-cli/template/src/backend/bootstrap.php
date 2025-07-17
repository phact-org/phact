<?php

require realpath(PHACT_ROOT . '/vendor/autoload.php');

use Phact\Phact\Config;
use Phact\Phact\RouteLoader;
use Phact\Phact\Router;

Config::setPhactRootPath(PHACT_ROOT);

try {
    RouteLoader::loadRoutes();
    $response = Router::dispatch();
    $response->send();
} catch (Exception $e) {
    echo $e->getMessage();
}
