import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import {execSync} from 'child_process'
import emptyModuleDefault from './utils/empty-module-default'
import consoleLog from './utils/console-log'
import tryPull from './utils/try-pull'

const gitPlantform = 'http://gitlab.baidu.com'
const gitPlantformGroup = 'tb-component'

const getModulePath = (info)=> {
    return `./lib/${info.categoryName}/${info.module.path}`
}

const createIfNotExist = (targetPath)=> {
    if (fs.existsSync(path.join(targetPath))) return
    mkdirp.sync(path)
}

const createLibFolderIfNotExist = ()=> {
    createIfNotExist('lib')
}

const createCategoryFolderIfNotExist = (info)=> {
    createIfNotExist(path.join('lib', info.categoryName))
}

const getGitSourcePath = (info)=> {
    // 获取git地址
    let gitSourcePath
    if (info.categoryInfo.gitlabPrefix !== '') {
        gitSourcePath = `${info.categoryInfo.gitlabPrefix}-${info.module.path}.git`
    } else {
        gitSourcePath = `${info.module.path}.git`
    }
    return gitSourcePath
}

const cloneModuleIfNotExist = (info)=> {
    const targetPath = path.join('lib', info.categoryName, info.module.path)
    if (fs.existsSync(targetPath)) return

    const gitSourcePath = getGitSourcePath(info)
    // clone
    const cloneSource = `${gitPlantform}/${gitPlantformGroup}/${gitSourcePath}`
    execSync(`cd lib/${info.categoryName};git clone ${cloneSource} ${info.module.path}`)
    consoleLog('cloned', 'green', getModulePath(info))
}

const checkGitControl = (info)=> {
    // 获得当前项目的git路径
    let projectName = execSync(`cd lib/${info.categoryName}/${info.module.path};git remote -v | head -n1 | awk '{print $2}' | sed -e 's,.*:\(.*/\)\?,,' -e 's/\.git$//'`).toString().trim()

    let gitSourcePath = getGitSourcePath(info)
    let expectModuleName = `${gitPlantform}/${gitPlantformGroup}/${gitSourcePath}`

    if (projectName + '.git' !== expectModuleName) {
        consoleLog(`错误:不要手动创建lib目录的任何文件夹,请在${gitPlantform}/${gitPlantformGroup}建立项目后,填写到all-component.json, 再重新执行npm update会自动创建,请删除此文件夹（删除前先做好备份）`, 'red', getModulePath(info))
    }
}

export default (info)=> {
    // 创建 lib 文件夹
    createLibFolderIfNotExist()
    // 创建 分类 文件夹
    createCategoryFolderIfNotExist(info)
    // clone 组件
    cloneModuleIfNotExist(info)
    // 判断当前组件目录 git版本控制是否正确
    checkGitControl(info)
    // try pull
    tryPull(getModulePath(info))
    // 补上组件没有的文件
    emptyModuleDefault(info)
}