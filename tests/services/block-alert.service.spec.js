describe('BlockAlertService', () => {
  let $translate
  let blockAlert

  beforeEach(angular.mock.module('walletApp'))

  beforeEach(() => angular.mock.inject(($injector) => {
    $translate = $injector.get('$translate')
    blockAlert = $injector.get('blockAlert')
    spyOn($translate, 'instant').and.callThrough()
  }))

  let header = () => blockAlert.header('header')
  let section = () => blockAlert.section('section_title', 'section_body')
  let action = () => blockAlert.action('action_title', 'www.example.com')
  let validConfig = () => blockAlert.createInfo(header(), [section(), section()], action(), { hideType: 'collapse' })

  describe('.isValidConfig', () => {
    it('should detect a valid config', () => {
      let config = validConfig()
      expect(blockAlert.isValidConfig(config)).toEqual(true)
    })

    it('should be invalid if type is missing', () => {
      let config = validConfig()
      config.type = void 0
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })

    it('should be invalid if hideType is incorrect', () => {
      let config = validConfig()
      config.hideType = 'hidden'
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })

    it('should be invalid if header is invalid', () => {
      let config = validConfig()
      config.header = {}
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })

    it('should be invalid if there are no sections', () => {
      let config = validConfig()
      config.sections = []
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })

    it('should be invalid if there is an invalid section title', () => {
      let config = validConfig()
      config.sections[1].title = {}
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })

    it('should be invalid if there is an invalid section body', () => {
      let config = validConfig()
      config.sections[1].body = {}
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })

    it('should be invalid if the action title is invalid', () => {
      let config = validConfig()
      config.action.title = {}
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })

    it('should be invalid if the action link is invalid', () => {
      let config = validConfig()
      config.action.link = 23
      expect(blockAlert.isValidConfig(config)).toEqual(false)
    })
  })

  describe('.localizeConfig', () => {
    const result = {
      type: 'info',
      hideType: void 0,
      header: 'header',
      sections: [{ title: 'title', body: 'body' }],
      action: { title: 'action', link: 'www.example.com' }
    }

    it('should properly localize a config consisting of language/translation kv pairs', () => {
      let config = blockAlert.createInfo(
        { en: 'header' },
        [{ title: { en: 'title' }, body: { en: 'body' } }],
        { title: { en: 'action' }, link: 'www.example.com' }
      )
      expect(blockAlert.isValidConfig(config)).toEqual(true)
      expect(blockAlert.localizeConfig(config)).toEqual(result)
    })

    it('should ignore config items that are already strings', () => {
      let config = blockAlert.createInfo(
        'header',
        [{ title: 'title', body: 'body' }],
        { title: 'action', link: 'www.example.com' }
      )
      expect(blockAlert.isValidConfig(config)).toEqual(true)
      expect(blockAlert.localizeConfig(config)).toEqual(result)
    })
  })

  describe('.header', () => {
    it('should create a translated header', () => {
      let header = blockAlert.header('my_header')
      expect(header).toEqual('my_header')
      expect($translate.instant).toHaveBeenCalledWith('my_header')
    })
  })

  describe('.section', () => {
    it('should create a translated section', () => {
      let section = blockAlert.section('my_section_title', 'my_section_body')
      expect(section.title).toEqual('my_section_title')
      expect(section.body).toEqual('my_section_body')
      expect($translate.instant).toHaveBeenCalledWith('my_section_title')
      expect($translate.instant).toHaveBeenCalledWith('my_section_body')
    })
  })

  describe('.action', () => {
    it('should create a translated action with a link', () => {
      let action = blockAlert.action('my_action', 'www.example.com')
      expect(action.title).toEqual('my_action')
      expect(action.link).toEqual('www.example.com')
      expect($translate.instant).toHaveBeenCalledWith('my_action')
    })
  })

  describe('.createInfo', () => {
    it('should be of type "info"', () => {
      let config = blockAlert.createInfo()
      expect(config.type).toEqual('info')
    })

    it('should create a valid block alert', () => {
      let config = blockAlert.createInfo(header(), [section()], action())
      expect(blockAlert.isValidConfig(config)).toEqual(true)
    })

    it('should create an alert with a hideType', () => {
      let config = blockAlert.createInfo(header(), [section()], action(), { hideType: 'dismiss' })
      expect(config.hideType).toEqual('dismiss')
    })
  })

  describe('.createWarning', () => {
    it('should be of type "info"', () => {
      let config = blockAlert.createWarning()
      expect(config.type).toEqual('warning')
    })
  })

  describe('.createDanger', () => {
    it('should be of type "info"', () => {
      let config = blockAlert.createDanger()
      expect(config.type).toEqual('danger')
    })
  })
})
