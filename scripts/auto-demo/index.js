// 自动生成demo
// 包括
// src/components
// src/layout
// src/router
// resolve.js

import config from '../../all-component.json'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'

import mkRouter from './mk-router'
import mkLayout from './mk-layout'
import mkComponents from './mk-components'

mkRouter(config.categorys)
mkLayout(config.categorys)
mkComponents(config)