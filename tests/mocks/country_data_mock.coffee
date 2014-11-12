require = (name) ->
  if name == "country-data"
    c = {}
    
    c.countries = {
      GB: {name: "United Kingdom", countryCallingCodes: ["+44"]} 
      NL: {name: "The Netherlands", countryCallingCodes: ["+31"]} 
      US: {name: "United States", countryCallingCodes: ["+1"]} 
    }
    
    return c
  else
    return null