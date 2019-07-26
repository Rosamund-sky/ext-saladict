import React from 'react'
import i18next from 'i18next'
import { CSSTransition } from 'react-transition-group'
import {
  useObservable,
  useObservableCallback,
  useObservableState,
  identity
} from 'observable-hooks'
import { merge } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { hover, hoverWithDelay, focusBlur } from '@/_helpers/observables'
import { updateActiveProfileID, getProfileName } from '@/_helpers/profile-manager'
import { FloatBox } from './FloatBox'
import { OptionsBtn } from './MenubarBtns'

export interface ProfilesProps {
  t: i18next.TFunction
  profiles: Array<{ id: string; name: string }>
  activeProfileId: string
}

/**
 * Pick and choose profiles
 */
export const Profiles = React.memo((props: ProfilesProps) => {
  const [onMouseOverOutDelay, mouseOverOutDelay$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hoverWithDelay)

  const [onMouseOverOut, mouseOverOut$] = useObservableCallback<
    boolean,
    React.MouseEvent<Element>
  >(hover)

  const [onFocusBlur, focusBlur$] = useObservableCallback(focusBlur)

  const [showHideProfiles, showHideProfiles$] = useObservableCallback<boolean>(
    identity
  )

  const isShowProfiles = useObservableState(
    useObservable(() => merge(mouseOverOut$, mouseOverOutDelay$, focusBlur$, showHideProfiles$)).pipe(
      debounceTime(100)
    ),
    false
  )

  const listItem = props.profiles.map(p => {
    return {
      key: p.id,
      content: (
        <span
          className={`menuBar-ProfileItem${
            p.id === props.activeProfileId ? ' isActive' : ''
            }`}
        >
          {getProfileName(p.name, props.t)}
        </span>
      )
    }
  })

  return (
    <div className='menuBar-ProfileContainer'>
      <OptionsBtn
        t={props.t}
        disabled={window.__SALADICT_OPTIONS_PAGE__}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            e.stopPropagation()
            showHideProfiles(true)
          }
        }}
        onMouseOver={onMouseOverOutDelay}
        onMouseOut={onMouseOverOutDelay}
      />
      {!window.__SALADICT_OPTIONS_PAGE__ && (
        <CSSTransition
          classNames="menuBar-Profiles"
          in={isShowProfiles}
          timeout={100}
          mountOnEnter={true}
          unmountOnExit={true}
        >
          <div className='menuBar-ProfileBox'>
            <FloatBox
              list={listItem}
              onFocus={onFocusBlur}
              onBlur={onFocusBlur}
              onMouseOver={onMouseOverOut}
              onMouseOut={onMouseOverOut}
              onArrowUpFirst={container =>
                (container.lastElementChild as HTMLButtonElement).focus()
              }
              onArrowDownLast={container =>
                (container.firstElementChild as HTMLButtonElement).focus()
              }
              onSelect={updateActiveProfileID}
            />
          </div>
        </CSSTransition>
      )}
    </div>
  )
})
