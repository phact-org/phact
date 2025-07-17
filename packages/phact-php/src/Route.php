<?php
namespace Phact\Phact;

class Route
{
    private static ?Route $instance = null;
    private array $routes = [];

    private function __construct()
    {
    }

    public static function get($address, $handler): void
    {
        self::getInstance()->routes['GET'][$address] = $handler;
    }

    public static function post($address, $handler): void
    {
        self::getInstance()->routes['POST'][$address] = $handler;
    }

    public static function getInstance(): ?Route
    {
        if (self::$instance == null) {
            self::$instance = new Route();
        }

        return self::$instance;
    }

    public static function getRoutes(): array
    {
        return self::getInstance()->routes;
    }
}
