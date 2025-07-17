<?php
namespace Phact\Phact;

class Request
{
    public static function getMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public static function getUri(): string
    {
        $uri = $_SERVER['REQUEST_URI'];
        $uri = strtok($uri, '?');
        return rtrim($uri, '/') ?: '/';
    }
}
