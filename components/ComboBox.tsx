import { XMarkIcon } from "@heroicons/react/24/solid";
import type { ComboBoxProps } from "@react-types/combobox";
import * as React from "react";
import { useButton, useComboBox, useFilter, useSearchField } from "react-aria";
import { useComboBoxState, useSearchFieldState } from "react-stately";

import { ListBox } from "./ListBox";
import { Popover } from "./Popover";

export { Item } from "react-stately";

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  let { contains } = useFilter({ sensitivity: "base" });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

  let inputRef = React.useRef(null);
  let listBoxRef = React.useRef(null);
  let popoverRef = React.useRef(null);

  let { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state
  );

  // Get props for the clear button from useSearchField
  let searchProps = {
    label: props.label,
    value: state.inputValue,
    onChange: (v: string) => state.setInputValue(v),
  };

  let searchState = useSearchFieldState(searchProps);
  let { clearButtonProps } = useSearchField(searchProps, searchState, inputRef);
  let clearButtonRef = React.useRef(null);
  let { buttonProps } = useButton(clearButtonProps, clearButtonRef);
  let outerRef = React.useRef(null);

  return (
    <div className="inline-flex flex-col relative grow">
      <label
        {...labelProps}
        className="block text-sm font-medium text-gray-500 text-left leading-6"
      >
        {props.label}
      </label>
      <div
        ref={outerRef}
        className={`relative px-2 inline-flex items-center rounded-md overflow-hidden shadow-sm border-2 bg-neutral-900 ${
          state.isFocused ? "border-neutral-200" : "border-neutral-400"
        }`}
      >
        <input
          {...inputProps}
          ref={inputRef}
          className="w-full outline-none px-3 py-1 bg-neutral-900"
        />
        <button
          {...buttonProps}
          ref={clearButtonRef}
          style={{ visibility: state.inputValue !== "" ? "visible" : "hidden" }}
          className="cursor-pointer text-neutral-300 hover:text-neutral-200"
        >
          <XMarkIcon aria-hidden="true" className="w-4 h-4" />
        </button>
      </div>
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          triggerRef={outerRef}
          state={state}
          isNonModal
          placement="bottom start"
          className="w-52"
        >
          <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
        </Popover>
      )}
    </div>
  );
}
