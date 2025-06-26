export interface VinData {
  year?: string
  make?: string
  model?: string
  trim?: string
  engine?: string
  fuelType?: string
  bodyClass?: string
  driveType?: string
}

export async function decodeVin(vin: string): Promise<VinData | null> {
  try {
    // Clean VIN - remove spaces and convert to uppercase
    const cleanVin = vin.replace(/\s+/g, '').toUpperCase()
    
    // Validate VIN format (17 characters, alphanumeric except I, O, Q)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
      throw new Error('Invalid VIN format')
    }

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVin}?format=json`
    )
    
    if (!response.ok) {
      throw new Error('Failed to decode VIN')
    }

    const data = await response.json()
    
    if (!data.Results || data.Results.length === 0) {
      throw new Error('No VIN data found')
    }

    const results = data.Results
    const vinData: VinData = {}

    // Map NHTSA response to our format
    results.forEach((result: any) => {
      switch (result.Variable) {
        case 'Model Year':
          vinData.year = result.Value
          break
        case 'Make':
          vinData.make = result.Value
          break
        case 'Model':
          vinData.model = result.Value
          break
        case 'Trim':
          vinData.trim = result.Value
          break
        case 'Engine Configuration':
        case 'Engine Number of Cylinders':
          if (result.Value && result.Value !== 'Not Applicable') {
            vinData.engine = result.Value
          }
          break
        case 'Fuel Type - Primary':
          vinData.fuelType = result.Value
          break
        case 'Body Class':
          vinData.bodyClass = result.Value
          break
        case 'Drive Type':
          vinData.driveType = result.Value
          break
      }
    })

    return vinData
  } catch (error) {
    console.error('VIN decode error:', error)
    return null
  }
}