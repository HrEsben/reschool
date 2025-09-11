import {
  Popover as ChakraPopover,
  IconButton,
  type IconButtonProps,
  Portal,
} from "@chakra-ui/react"
import * as React from "react"
import { HiOutlineInformationCircle } from "react-icons/hi"

export interface ToggleTipProps extends ChakraPopover.RootProps {
  showArrow?: boolean
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement | null>
  content?: React.ReactNode
  contentProps?: ChakraPopover.ContentProps
}

export const ToggleTip = React.forwardRef<HTMLDivElement, ToggleTipProps>(
  function ToggleTip(props, ref) {
    const {
      showArrow = true,
      children,
      portalled = false, // Changed to false to prevent animations from top
      content,
      contentProps,
      portalRef,
      ...rest
    } = props

    return (
      <ChakraPopover.Root
        {...rest}
        positioning={{ 
          placement: "bottom",
          gutter: 8,
          ...rest.positioning 
        }}
      >
        <ChakraPopover.Trigger asChild>{children}</ChakraPopover.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraPopover.Positioner>
            <ChakraPopover.Content
              width="auto"
              maxWidth="250px"
              px="3"
              py="2"
              fontSize="sm"
              rounded="lg"
              bg="white"
              color="gray.700"
              border="1px solid"
              borderColor="gray.200"
              shadow="lg"
              outline="none"
              _focus={{ outline: "none", boxShadow: "none" }}
              _focusVisible={{ outline: "none", boxShadow: "none" }}
              ref={ref}
              {...contentProps}
            >
              {showArrow && (
                <ChakraPopover.Arrow>
                  <ChakraPopover.ArrowTip 
                    borderColor="gray.200"
                  />
                </ChakraPopover.Arrow>
              )}
              {content}
            </ChakraPopover.Content>
          </ChakraPopover.Positioner>
        </Portal>
      </ChakraPopover.Root>
    )
  },
)

export interface InfoTipProps extends Partial<ToggleTipProps> {
  buttonProps?: IconButtonProps | undefined
}

export const InfoTip = React.forwardRef<HTMLDivElement, InfoTipProps>(
  function InfoTip(props, ref) {
    const { children, buttonProps, ...rest } = props
    return (
      <ToggleTip content={children} {...rest} ref={ref}>
        <IconButton
          variant="ghost"
          aria-label="info"
          size="2xs"
          colorPalette="gray"
          {...buttonProps}
        >
          <HiOutlineInformationCircle />
        </IconButton>
      </ToggleTip>
    )
  },
)
