# Test script to verify the scheduledTime fix
$baseUrl = "http://localhost:3002"

# First get competitions
try {
    Write-Host "Getting competitions..." -ForegroundColor Yellow
    $competitions = Invoke-RestMethod -Uri "$baseUrl/competitions" -Method GET
    
    if ($competitions.Count -eq 0) {
        Write-Host "No competitions found. Creating one..." -ForegroundColor Yellow
        
        # Create a test competition
        $competitionData = @{
            name = "Test Competition"
            description = "Test competition for scheduledTime fix"
            startDate = "2025-07-12"
            endDate = "2025-07-12"
            location = "Test Location"
            type = "TRACK_AND_FIELD"
            status = "DRAFT"
        } | ConvertTo-Json
        
        $newCompetition = Invoke-RestMethod -Uri "$baseUrl/competitions" -Method POST -Body $competitionData -ContentType "application/json"
        $competitionId = $newCompetition.id
        Write-Host "Competition created: $($newCompetition.name) (ID: $competitionId)" -ForegroundColor Green
    } else {
        $competitionId = $competitions[0].id
        Write-Host "Using competition: $($competitions[0].name) (ID: $competitionId)" -ForegroundColor Green
    }
    
    # Test event creation with scheduledTime
    $eventData = @{
        name = "Test Event with Scheduled Time"
        type = "TRACK"
        gender = "MALE"
        category = "SENIOR"
        unit = "TIME"
        competitionId = $competitionId
        maxParticipants = 50
        seedTimeRequired = $false
        discipline = "sprint"
        distance = "100m"
        scheduledTime = "2025-07-12T15:30"
    } | ConvertTo-Json
    
    Write-Host "📝 Creating event with scheduledTime: 2025-07-12T15:30" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$baseUrl/events" -Method POST -Body $eventData -ContentType "application/json"
    
    Write-Host "✅ Event created successfully!" -ForegroundColor Green
    Write-Host "📊 Event ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "📊 Scheduled Time: $($response.scheduledTime)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}