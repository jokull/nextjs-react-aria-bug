import { type MenuTriggerAction } from "@react-types/combobox";

import { Key, useState } from "react";
import { SSRProvider, useFilter } from "react-aria";
import { ComboBox, Item } from "../components/ComboBox";

interface Workout {
  description: string;
  value: string;
}

interface Item {
  description: string;
  key: string;
}

type DescriptionFieldState = {
  selectedKey: Key | null;
  inputValue: string;
  items: Item[];
};

function useFieldState(items: readonly Item[]) {
  // Store ComboBox input value, selected option, open state, and items
  // in a state tracker
  return useState<DescriptionFieldState>({
    selectedKey: "",
    inputValue: "",
    items: Array.from(items),
  });
}

function DescriptionField({
  state,
  optionList,
}: {
  state: ReturnType<typeof useFieldState>;
  optionList: readonly Item[];
}) {
  const [fieldState, setFieldState] = state;

  // Implement custom filtering logic and control what items are
  // available to the ComboBox.
  let { startsWith } = useFilter({ sensitivity: "base" });

  // Specify how each of the ComboBox values should change when an
  // option is selected from the list box
  let onSelectionChange = (key: Key) => {
    setFieldState((prevState) => {
      let selectedItem = prevState.items.find((option) => option.key === key);
      return {
        inputValue: selectedItem?.description ?? prevState.inputValue,
        selectedKey: key,
        items: optionList.filter((item) =>
          startsWith(item.description, selectedItem?.description ?? "")
        ),
      };
    });
  };

  // Specify how each of the ComboBox values should change when the input
  // field is altered by the user
  let onInputChange = (value: string) => {
    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: value === "" ? null : prevState.selectedKey,
      items: optionList.filter((item) => startsWith(item.description, value)),
    }));
  };

  // Show entire list if user opens the menu manually
  let onOpenChange = (
    isOpen: boolean,
    menuTrigger: MenuTriggerAction | undefined
  ) => {
    if (menuTrigger === "manual" && isOpen) {
      setFieldState((prevState) => ({
        inputValue: prevState.inputValue,
        selectedKey: prevState.selectedKey,
        items: Array.from(optionList),
      }));
    }
  };

  return (
    <ComboBox
      label="Workout / Lift"
      allowsCustomValue
      items={fieldState.items}
      selectedKey={fieldState.selectedKey}
      inputValue={fieldState.inputValue}
      onOpenChange={onOpenChange}
      onSelectionChange={onSelectionChange}
      onInputChange={onInputChange}
    >
      {(item) => <Item key={item.key}>{item.description}</Item>}
    </ComboBox>
  );
}

function getDescriptionItems(workouts: Workout[]): readonly Item[] {
  let choices: Item[] = [];
  workouts.forEach(({ description }) => {
    if (
      !choices.find(
        (name) => name.key === description.toLocaleLowerCase().trim()
      )
    ) {
      choices.push({
        key: description.toLocaleLowerCase(),
        description: description,
      });
    }
  });
  return choices;
}

function CreateWorkout({ workouts }: { workouts: Workout[] }) {
  const items = getDescriptionItems(workouts);
  const descriptionFieldState = useFieldState(items);

  function onSubmit() {}

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <fieldset className="flex gap-4 w-full items-end">
        <DescriptionField state={descriptionFieldState} optionList={items} />
        <button
          type="submit"
          className="py-1.5 px-3 font-bold bg-neutral-200 text-neutral-900 rounded-md shadow-sm"
        >
          Save
        </button>
      </fieldset>
    </form>
  );
}

export default function Page() {
  return (
    <SSRProvider>
      <CreateWorkout workouts={[{ description: "back squat", value: "100" }]} />
    </SSRProvider>
  );
}
