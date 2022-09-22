import log, { LogLevelDesc } from 'loglevel'
import packageJson from '../../package.json'

const logDebug = (
  {
    level,
    appName = '',
    version = '',
    storeWindow = false,
  }: {
    level?: LogLevelDesc
    appName?: string
    version?: string
    storeWindow?: boolean
  } = {
    appName: '',
    version: '',
    storeWindow: false,
  }
) => {
  const genTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const hour = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours()
    const min =
      now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()
    const s = now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds()
    const nowString = `${year}-${month}-${day} ${hour}:${min}:${s}`
    return nowString
  }

  const genUserAgent = () => {
    try {
      const ua = navigator.userAgent.toLocaleLowerCase()
      const re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/
      const m = ua.match(re) || []
      const browser = m[1].replace(/version/, 'safari')
      const ver = m[2]
      return {
        browser,
        ver,
      }
    } catch (error) {
      return null
    }
  }

  const proxyLog = () => {
    const _log = new Proxy(log, {
      get(target, prop: string) {
        if (!(prop in target)) {
          return
        }
        const func = target[prop]
        if (
          !['log', 'info', 'warn', 'error', 'trace', 'debug'].includes(prop)
        ) {
          return func
        }
        const uaInfo = genUserAgent()
        let prefix = ''
        if (uaInfo) {
          prefix = `[ ${appName} ${version} ${uaInfo.browser}:${
            uaInfo.ver
          } ${genTime()} ]`
        } else {
          prefix = `[ ${appName} ${version} ${genTime()} ]`
        }
        return func.bind(null, prefix)
      },
    })
    return _log
  }

  const logger = proxyLog()

  if (level) {
    logger.setLevel(level)
  }
  if (storeWindow) {
    // @ts-ignore
    window.__LOGGER__ = logger
  }

  return logger
}

export function createLoggerDecorator(MODULE_NAME: string, logger?: any) {
  return function (
    target: any,
    propKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value
    descriptor.value = async function (...args: any) {
      if (!logger) {
        // @ts-ignore
        logger = this.logger
      }
      if (['log', 'error'].some((item) => !logger[item])) {
        console.warn('loggerDecorator warning: your logger is not complete')
      }
      try {
        logger?.log(MODULE_NAME, method.name, ...args)
        const res = await method.apply(this, args)
        logger?.log(MODULE_NAME, `${method.name} success: `, res)
        return res
      } catch (err) {
        logger?.error(MODULE_NAME, `${method.name} failed: `, err)
        throw err
      }
    }
  }
}

export const logger = logDebug({
  level: 'debug',
  appName: packageJson.name,
  version: packageJson.version,
})

export default logDebug
