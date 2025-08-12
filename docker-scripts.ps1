# Docker Scripts for Analytics Frontend
# Usage: .\docker-scripts.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Analytics Frontend Docker Scripts" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  dev          - Start development server"
    Write-Host "  prod         - Start production server on port 80"
    Write-Host "  prod-custom  - Start production server on port 3000"
    Write-Host "  build        - Build all images"
    Write-Host "  stop         - Stop all services"
    Write-Host "  clean        - Stop and remove all containers, images, and volumes"
    Write-Host "  logs         - Show logs for running services"
    Write-Host "  help         - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\docker-scripts.ps1 dev"
    Write-Host "  .\docker-scripts.ps1 prod"
    Write-Host "  .\docker-scripts.ps1 clean"
}

function Start-Development {
    Write-Host "Starting development server..." -ForegroundColor Green
    docker-compose --profile dev up --build
}

function Start-Production {
    Write-Host "Starting production server on port 80..." -ForegroundColor Green
    docker-compose --profile prod up --build
}

function Start-ProductionCustom {
    Write-Host "Starting production server on port 3000..." -ForegroundColor Green
    docker-compose --profile prod-custom up --build
}

function Build-Images {
    Write-Host "Building all Docker images..." -ForegroundColor Green
    docker-compose build
}

function Stop-Services {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    docker-compose down
}

function Clean-All {
    Write-Host "Cleaning up all Docker resources..." -ForegroundColor Red
    docker-compose down -v --rmi all
    docker system prune -f
}

function Show-Logs {
    Write-Host "Showing logs for running services..." -ForegroundColor Green
    docker-compose logs -f
}

# Main script logic
switch ($Command.ToLower()) {
    "dev" { Start-Development }
    "prod" { Start-Production }
    "prod-custom" { Start-ProductionCustom }
    "build" { Build-Images }
    "stop" { Stop-Services }
    "clean" { Clean-All }
    "logs" { Show-Logs }
    "help" { Show-Help }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use 'help' to see available commands" -ForegroundColor Yellow
        Show-Help
    }
}
