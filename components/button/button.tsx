/* eslint-disable react/button-has-type */
// 🌟引入classNames
import classNames from 'classnames';
// 🌟引入omit
import omit from 'rc-util/lib/omit';
// 🌟引入react的全部
import * as React from 'react';
// 🌟引入上下文配置文件
import { ConfigContext } from '../config-provider';
// 🌟引入禁用上下文文件
import DisabledContext from '../config-provider/DisabledContext';
// 🌟引入配置文件中的Size上下文的Size类型
import type { SizeType } from '../config-provider/SizeContext';
// 🌟引入配置问津啊中的Size上下文
import SizeContext from '../config-provider/SizeContext';
// 🌟引入工具库中的react节点的克隆节点
import { cloneElement } from '../_util/reactNode';
// 🌟引入工具库中的类型中的元祖
import { tuple } from '../_util/type';
// 🌟引入工具库中的警告中的警告
import warning from '../_util/warning';
// 🌟引入工具库中的波浪中的波浪
import Wave from '../_util/wave';
// 🌟引入按钮集群中的集群, 集群尺寸上下文
import Group, { GroupSizeContext } from './button-group';
// 🌟引入同级文件中的加载图标
import LoadingIcon from './LoadingIcon';
// 🌟声明正则匹配2个汉字字符的正则
const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
// 🌟正则匹配是否成功, 强行绑定this至rxTwoCNChar
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
// 🌟通过typeof检测参数是否为字符串, 封装为一个函数, 返回值为boolean
function isString(str: any) {
  return typeof str === 'string';
}
// 🌟是否为不包含边框的Button, 返回值为boolean
function isUnBorderedButtonType(type: ButtonType | undefined) {
  return type === 'text' || type === 'link';
}
// 🌟React.isValidElement判断传入参数是否为有效的React节点, 并且判断是React节点的情况下, 是否也是React.Fragment
function isReactFragment(node: React.ReactNode) {
  return React.isValidElement(node) && node.type === React.Fragment;
}
// 🌟插入空格, 接受两个参数, child为React节点或字符串或数字, needInserted为布尔值
// Insert one space between two chinese characters automatically.
function insertSpace(child: React.ReactElement | string | number, needInserted: boolean) {
  // Check the child if is undefined or null.
  // 🌟如果child为null或undefined
  if (child === null || child === undefined) {
    // 🌟返回
    return;
  }
  // 🌟声明SPACE, 值为根据needInserted如果传, 为携带空格的字符串, 否则为空字符串
  const SPACE = needInserted ? ' ' : '';
  // strictNullChecks oops.
  // 🌟child不为string类型并且child不等于number类型并且child的type属性为字符串并且child的props的children是否包含2个中文
  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    // 🌟返回调用cloneElement函数, 传入child, 传入对象包含children属性, 值为child的props的children分割后合并, 是否加入空格取决于上面的needInsert参数
    return cloneElement(child, {
      children: child.props.children.split('').join(SPACE),
    });
  }
  // 🌟如果child的类型为字符串, 返回字符串, 根据是否包含两个中文字符决定是否加入空格
  if (typeof child === 'string') {
    return isTwoCNChar(child) ? <span>{child.split('').join(SPACE)}</span> : <span>{child}</span>;
  }
  // 🌟如果child是reactfragment, 那么就用span将其包裹起来返回
  if (isReactFragment(child)) {
    return <span>{child}</span>;
  }
  // 🌟数字类型直接返回child
  return child;
}

function spaceChildren(children: React.ReactNode, needInserted: boolean) {
  let isPrevChildPure: boolean = false;
  const childList: React.ReactNode[] = [];
  React.Children.forEach(children, child => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }

    isPrevChildPure = isCurrentChildPure;
  });

  // Pass to React.Children.map to auto fill key
  return React.Children.map(childList, child =>
    insertSpace(child as React.ReactElement | string | number, needInserted),
  );
}

const ButtonTypes = tuple('default', 'primary', 'ghost', 'dashed', 'link', 'text');
export type ButtonType = typeof ButtonTypes[number];
const ButtonShapes = tuple('default', 'circle', 'round');
export type ButtonShape = typeof ButtonShapes[number];
const ButtonHTMLTypes = tuple('submit', 'button', 'reset');
export type ButtonHTMLType = typeof ButtonHTMLTypes[number];

export type LegacyButtonType = ButtonType | 'danger';
export function convertLegacyProps(type?: LegacyButtonType): ButtonProps {
  if (type === 'danger') {
    return { danger: true };
  }
  return { type };
}

export interface BaseButtonProps {
  type?: ButtonType;
  icon?: React.ReactNode;
  /**
   * Shape of Button
   *
   * @default default
   */
  shape?: ButtonShape;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | { delay?: number };
  prefixCls?: string;
  className?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  children?: React.ReactNode;
}

// Typescript will make optional not optional if use Pick with union.
// Should change to `AnchorButtonProps | NativeButtonProps` and `any` to `HTMLAnchorElement | HTMLButtonElement` if it fixed.
// ref: https://github.com/ant-design/ant-design/issues/15930
export type AnchorButtonProps = {
  href: string;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<any>, 'type' | 'onClick'>;

export type NativeButtonProps = {
  htmlType?: ButtonHTMLType;
  onClick?: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<any>, 'type' | 'onClick'>;

export type ButtonProps = Partial<AnchorButtonProps & NativeButtonProps>;

interface CompoundedComponent
  extends React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLElement>> {
  Group: typeof Group;
  __ANT_BUTTON: boolean;
}

type Loading = number | boolean;

const InternalButton: React.ForwardRefRenderFunction<unknown, ButtonProps> = (props, ref) => {
  const {
    loading = false,
    prefixCls: customizePrefixCls,
    type = 'default',
    danger,
    shape = 'default',
    size: customizeSize,
    disabled: customDisabled,
    className,
    children,
    icon,
    ghost = false,
    block = false,
    /** If we extract items here, we don't need use omit.js */
    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    htmlType = 'button' as ButtonProps['htmlType'],
    ...rest
  } = props;

  const size = React.useContext(SizeContext);
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled || disabled;

  const groupSize = React.useContext(GroupSizeContext);
  const [innerLoading, setLoading] = React.useState<Loading>(!!loading);
  const [hasTwoCNChar, setHasTwoCNChar] = React.useState(false);
  const { getPrefixCls, autoInsertSpaceInButton, direction } = React.useContext(ConfigContext);
  const buttonRef = (ref as any) || React.createRef<HTMLElement>();

  const isNeedInserted = () =>
    React.Children.count(children) === 1 && !icon && !isUnBorderedButtonType(type);

  const fixTwoCNChar = () => {
    // Fix for HOC usage like <FormatMessage />
    if (!buttonRef || !buttonRef.current || autoInsertSpaceInButton === false) {
      return;
    }
    const buttonText = buttonRef.current.textContent;
    if (isNeedInserted() && isTwoCNChar(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  };

  // =============== Update Loading ===============
  const loadingOrDelay: Loading = typeof loading === 'boolean' ? loading : loading?.delay || true;

  React.useEffect(() => {
    let delayTimer: number | null = null;

    if (typeof loadingOrDelay === 'number') {
      delayTimer = window.setTimeout(() => {
        delayTimer = null;
        setLoading(loadingOrDelay);
      }, loadingOrDelay);
    } else {
      setLoading(loadingOrDelay);
    }

    return () => {
      if (delayTimer) {
        // in order to not perform a React state update on an unmounted component
        // and clear timer after 'loadingOrDelay' updated.
        window.clearTimeout(delayTimer);
        delayTimer = null;
      }
    };
  }, [loadingOrDelay]);

  React.useEffect(fixTwoCNChar, [buttonRef]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
    const { onClick } = props;
    // https://github.com/ant-design/ant-design/issues/30207
    if (innerLoading || mergedDisabled) {
      e.preventDefault();
      return;
    }
    (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)?.(e);
  };

  warning(
    !(typeof icon === 'string' && icon.length > 2),
    'Button',
    `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`,
  );

  warning(
    !(ghost && isUnBorderedButtonType(type)),
    'Button',
    "`link` or `text` button can't be a `ghost` button.",
  );

  const prefixCls = getPrefixCls('btn', customizePrefixCls);
  const autoInsertSpace = autoInsertSpaceInButton !== false;

  const sizeClassNameMap = { large: 'lg', small: 'sm', middle: undefined };
  const sizeFullname = groupSize || customizeSize || size;
  const sizeCls = sizeFullname ? sizeClassNameMap[sizeFullname] || '' : '';

  const iconType = innerLoading ? 'loading' : icon;

  const linkButtonRestProps = omit(rest as AnchorButtonProps & { navigate: any }, ['navigate']);

  const classes = classNames(
    prefixCls,
    {
      [`${prefixCls}-${shape}`]: shape !== 'default' && shape, // Note: Shape also has `default`
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-icon-only`]: !children && children !== 0 && !!iconType,
      [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonType(type),
      [`${prefixCls}-loading`]: innerLoading,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace && !innerLoading,
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-dangerous`]: !!danger,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-disabled`]: linkButtonRestProps.href !== undefined && mergedDisabled,
    },
    className,
  );

  const iconNode =
    icon && !innerLoading ? (
      icon
    ) : (
      <LoadingIcon existIcon={!!icon} prefixCls={prefixCls} loading={!!innerLoading} />
    );

  const kids =
    children || children === 0
      ? spaceChildren(children, isNeedInserted() && autoInsertSpace)
      : null;

  if (linkButtonRestProps.href !== undefined) {
    return (
      <a {...linkButtonRestProps} className={classes} onClick={handleClick} ref={buttonRef}>
        {iconNode}
        {kids}
      </a>
    );
  }

  const buttonNode = (
    <button
      {...(rest as NativeButtonProps)}
      type={htmlType}
      className={classes}
      onClick={handleClick}
      disabled={mergedDisabled}
      ref={buttonRef}
    >
      {iconNode}
      {kids}
    </button>
  );

  if (isUnBorderedButtonType(type)) {
    return buttonNode;
  }

  return <Wave disabled={!!innerLoading}>{buttonNode}</Wave>;
};

const Button = React.forwardRef<unknown, ButtonProps>(InternalButton) as CompoundedComponent;
if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}

Button.Group = Group;
Button.__ANT_BUTTON = true;

export default Button;
