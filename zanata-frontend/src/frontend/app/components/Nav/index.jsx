import React, { PropTypes } from 'react'
import NavItem from './NavItem'
import { flattenThemeClasses } from 'zanata-ui'
// import { startsWith } from 'lodash'
import { getDswid } from '../../utils/UrlHelper'

const dswid = getDswid()

/**
 * URL path for frontend
 * e.g. http://localhost:8080/app/#explore
 */
const prefixPath = '/a/'

const items = [
  {
    icon: 'zanata',
    link: '/',
    href: '/',
    title: 'Zanata',
    auth: 'public',
    id: 'nav_home'
  },
  {
    icon: 'search',
    link: prefixPath + dswid + '#explore',
    internalLink: '/explore',
    title: 'Explore',
    auth: 'public',
    id: 'nav_search'
  },
  {
    small: true,
    icon: 'import',
    link: '/login',
    title: 'Log In',
    auth: 'loggedout',
    id: 'nav_login'
  },
  {
    small: true,
    icon: 'upload',
    link: '/signup',
    title: 'Sign Up',
    auth: 'loggedout',
    id: 'nav_sign_up'
  },
  {
    small: true,
    icon: 'dashboard',
    link: '/dashboard',
    title: 'Dashboard',
    auth: 'loggedin',
    id: 'nav_dashboard'
  },
  {
    small: true,
    icon: 'user',
    link: prefixPath + dswid + '#profile',
    internalLink: '/profile',
    title: 'Profile',
    auth: 'loggedin',
    id: 'nav_profile'
  },
  {
    icon: 'glossary',
    link: prefixPath + dswid + '#glossary',
    internalLink: '/glossary',
    title: 'Glossary',
    auth: 'loggedin',
    id: 'nav_glossary'
  },
  {
    icon: 'language',
    link: '/language/list',
    title: 'Languages',
    auth: 'loggedin',
    id: 'nav_language'
  },
  {
    icon: 'settings',
    link: '/dashboard/settings',
    title: 'Settings',
    auth: 'loggedin',
    id: 'nav_settings'
  },
  {
    icon: 'admin',
    link: '/admin/home',
    title: 'Admin',
    auth: 'admin',
    id: 'nav_admin'
  },
  {
    icon: 'logout',
    link: '/account/sign_out',
    title: 'Log Out',
    auth: 'loggedin',
    id: 'nav_logout'
  },
  {
    small: true,
    icon: 'ellipsis',
    link: prefixPath + 'more',
    title: 'More',
    auth: 'public',
    id: 'nav_more'
  }
]
const classes = {
  base: {
    bgc: 'Bgc(pri)',
    bxsh: 'Bxsh(ish1)',
    d: 'D(f)!',
    fld: 'Fld(c)--sm',
    flxs: 'Flxs(0)',
    h: 'H(100%)--sm',
    or: 'Or(1) Or(0)--sm',
    ov: 'Ov(h)',
    w: 'W(r3)--sm'
  }
}

/**
 * Generates side menu bar with icons
 */
const Nav = ({
  active,
  links,
  isJsfPage,
  loading,
  ...props
}) => {
  let auth = 'loggedout'
  if (window.config.permission.isLoggedIn === true) {
    auth = window.config.permission.isAdmin === true ? 'admin' : 'loggedin'
  }
  const admin = (auth === 'admin')

  const username = window.config.user ? window.config.user.username : ''
  return (
    <nav
      {...props}
      id='nav'
      name={username}
      className={flattenThemeClasses(classes)}>
      {items.map((item, itemId) => {
        if (((item.auth === 'public') || (item.auth === auth) ||
          (item.auth === 'loggedin' && admin))) {
          let link
          if (isJsfPage) {
            // jsf pages
            link = links[item.link]
              ? (links.context + links[item.link])
              : (links.context + item.link)
          } else {
            // react pages, /app/index.xhtml
            link = item.internalLink
              ? item.internalLink
              : (links[item.link]
                    ? (links.context + links[item.link])
                    : (links.context + item.link))
          }

          const useHref = isJsfPage || !item.internalLink
          const isActive = active === link

          return <NavItem key={itemId}
            loading={loading}
            id={item.id}
            small={item.small}
            active={isActive}
            link={link}
            useHref={useHref}
            icon={item.icon}
            tooltip={item.tooltip}
            title={item.title} />
        }
        return null
      })}
    </nav>
  )
}

Nav.propTypes = {
  /**
   * Current active path
   */
  active: PropTypes.string,
  /**
   * Object of links
   * e.g.
   * {
   * 'context': http://localhost:8080,
   * 'helpPage': http://localhost/help
   * }
   */
  links: PropTypes.object,
  /**
   * If true, all links will be using href
   * If false, RouterLink will be use
   */
  isJsfPage: PropTypes.bool,
  loading: PropTypes.bool
}

export default Nav
