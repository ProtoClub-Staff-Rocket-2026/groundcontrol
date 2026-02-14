"""Simulate telemetry events for Ground Control."""

import math
import random
import time
import urllib.request
import json

API_URL = "http://localhost:8000/events/"
INTERVAL = 0.5  # seconds between events

# Simulation parameters
SESSION_ID = f"sim-{int(time.time())}"
GROUND_PRESSURE = 1013.25  # hPa at sea level
T = 0  # elapsed seconds
VELOCITY = 0.0

print(f"Simulating launch telemetry → {API_URL}")
print(f"Session: {SESSION_ID}")
print(f"Sending every {INTERVAL}s. Ctrl+C to stop.\n")

try:
    while True:
        # Velocity: ramps up with some noise, caps around 300 m/s
        VELOCITY += random.uniform(1.5, 4.0)
        VELOCITY = min(VELOCITY, 300 + random.uniform(-5, 5))

        # Altitude estimate from velocity (simple integration)
        altitude = 0.5 * 3.0 * T**2  # rough quadratic climb

        # Air pressure decreases with altitude (barometric formula)
        pressure = GROUND_PRESSURE * math.exp(-altitude / 8500)
        pressure += random.uniform(-0.5, 0.5)  # sensor noise
        pressure = max(pressure, 1.0)

        event = {
            "timestamp": f"T+{T}",
            "identifier": SESSION_ID,
            "velocity": round(VELOCITY, 2),
            "air_pressure": round(pressure, 2),
        }

        data = json.dumps(event).encode()
        req = urllib.request.Request(API_URL, data=data, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req)

        print(f"T+{T:>4}s  vel={event['velocity']:>7.2f} m/s  pressure={event['air_pressure']:>8.2f} hPa")

        T += 1
        time.sleep(INTERVAL)

except KeyboardInterrupt:
    print(f"\nStopped after {T} events.")
