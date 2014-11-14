require = (name) ->
  if name == "country-data"
    c = {}
    
    c.countries = {
      all: {
        GB: {name: "United Kingdom", countryCallingCodes: ["+44"]} 
        NL: {name: "The Netherlands", countryCallingCodes: ["+31"]} 
        US: {name: "United States", countryCallingCodes: ["+1"]}
        DE: {name: "Germany", countryCallingCodes: ["+49"]}
      }

    }
    
    return c
  else
    return null