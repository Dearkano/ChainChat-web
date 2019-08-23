import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { debounce } from 'lodash-es'
export function bindURL(func, href) {
    return () => {
      if (window.location.href === href) {
        func()
      }
    }
  }
  

const WrapperDiv = styled.div`
  display: flex;
  flex-direction: ${props => (props.reverse ? 'column-reverse' : 'column')};
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
`

const InfiniteList = props => {
  const wrapperDom = useRef(null)
  const loadingDom = useRef(null)
  // 保证 bindFunc 取到最新的值
  const refProps = useRef(props)

  useEffect(()=>{

  }, [])

  useEffect(() => {
    refProps.current = props
  })

  useEffect(() => {
    const bindFunc = debounce(
      bindURL(() => {
        const { isEnd, isLoading, callback, inFixedContainer = false } = refProps.current
        if (isLoading || isEnd) {
          return
        }
        if (loadingDom.current === null || wrapperDom.current === null) {
          return
        }

        // 判断 loadingDom 是否出现在容器内部
        let isInViewport
        const loadingRect = loadingDom.current.getBoundingClientRect()

        if (inFixedContainer) {
          // 相对 wrapperDom
          const wrapperRect = wrapperDom.current.getBoundingClientRect()
          isInViewport =
            loadingRect.top < wrapperRect.bottom && loadingRect.bottom > wrapperRect.top
        } else {
          // 相对 windows
          isInViewport = loadingRect.top < window.innerHeight && loadingRect.bottom > 0
        }

        if (isInViewport) {
          callback()
        }
      }, window.location.href),
      250
    )

    const { inFixedContainer = false } = refProps.current

    if (inFixedContainer) {
      if (!wrapperDom.current) {
        return
      }
      wrapperDom.current.onscroll = bindFunc
    } else {
      window.addEventListener('scroll', bindFunc)

      return () => {
        window.removeEventListener('scroll', bindFunc)
      }
    }

    wrapperDom.current.scrollTop = wrapperDom.current.scrollHeight
  }, [])

  const { isEnd, reverse = false, children } = props

  return (
    <WrapperDiv ref={wrapperDom} reverse={reverse}>
      {children}
    </WrapperDiv>
  )
}

export default InfiniteList
