import { Component, type ReactNode } from 'react'
import { glInfo } from './gate'

export function webglSupported(): boolean {
  return glInfo().ok // one cached probe for the whole page
}

export const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
