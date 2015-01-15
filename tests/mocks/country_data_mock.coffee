require = (name) ->
  if name == "country-data"
    c = {}
    
    c.countries = {
      all: [
        {alpha2: "GB", name: "United Kingdom", countryCallingCodes: ["+44"]} 
        {alpha2: "NL", name: "The Netherlands", countryCallingCodes: ["+31"]} 
        {alpha2: "US", name: "United States", countryCallingCodes: ["+1"]}
        {alpha2: "DE", name: "Germany", countryCallingCodes: ["+49"]}
      ]

    }
    
    return c
  else
    return null