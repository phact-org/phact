<?php
namespace Phact\Phact;

use Exception;

class RouteLoader
{
    public static function loadRoutes(): void
    {
        $routesDir = realpath(Config::getPhactRootPath() . '/src/backend/routes');

        if (!$routesDir || !is_dir($routesDir)) {
            throw new Exception("Routes directory not found: $routesDir");
        }

        $routeFiles = glob($routesDir . '/*.php');

        foreach ($routeFiles as $file) {
            if (is_file($file)) {
                require_once $file;
            }
        }
    }
}
