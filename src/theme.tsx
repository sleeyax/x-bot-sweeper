import ConfigProvider from "antd/es/config-provider"
import type { PropsWithChildren, ReactNode } from "react"

export type ThemeProviderProps = PropsWithChildren

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1c9af0",
        }
      }}>
      {children}
    </ConfigProvider>
  )
}
