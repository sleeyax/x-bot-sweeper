import Alert from "antd/es/alert/Alert"
import Button from "antd/es/button"
import Divider from "antd/es/divider"
import Flex from "antd/es/flex"
import Form, { type FormProps } from "antd/es/form"
import InputNumber from "antd/es/input-number"
import Input from "antd/es/input/Input"
import Title from "antd/es/typography/Title"
import { useEffect, useMemo, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  defaultSettings,
  storageKeys,
  type Rules,
  type Settings
} from "~shared"

type FieldType = {
  ratio: string
  bannedKeywords?: string
  blockTimeout: number
  myFollowersListTimeout: number
}

function toFieldType({ rules, timeouts }: Settings): FieldType {
  return {
    ratio: rules.followingToFollowersRatio.toString(),
    bannedKeywords: rules.bannedKeywords.join(", "),
    blockTimeout: timeouts.blockTimeout,
    myFollowersListTimeout: timeouts.myFollowersListTimeout
  }
}

function OptionsIndex() {
  const [settingsAsJson, setSettingsAsJson] = useStorage<string>(
    storageKeys.settings,
    (value) => value ?? JSON.stringify(defaultSettings)
  )
  const settings = useMemo<Settings>(
    () => JSON.parse(settingsAsJson),
    [settingsAsJson]
  )
  const setSettings = (settings: Settings) =>
    setSettingsAsJson(JSON.stringify(settings))
  const [isSaved, setIsSaved] = useState(false)
  const [form] = Form.useForm()
  const ratio = Form.useWatch("ratio", form)
  const [minFollowing, setMinFollowing] = useState<string>()
  const [minFollowers, setMinFollowers] = useState<string>()

  const syncInputFields = (settings: Settings) => {
    form.setFieldsValue(toFieldType(settings))
  }

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    const newRatio = parseFloat(values.ratio)
    if (Number.isNaN(newRatio)) {
      syncInputFields(settings)
      return
    }

    const newSettings: Settings = {
      rules: {
        followingToFollowersRatio: newRatio,
        bannedKeywords: [
          ...new Set(
            (values.bannedKeywords ?? "")
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
          )
        ]
      },
      timeouts: {
        blockTimeout: values.blockTimeout,
        myFollowersListTimeout: values.myFollowersListTimeout
      }
    }
    setSettings(newSettings)
    syncInputFields(newSettings)
    setIsSaved(true)
  }

  const reset = () => {
    setSettings(defaultSettings)
    syncInputFields(defaultSettings)
    setMinFollowers(undefined)
    setMinFollowing(undefined)
    setIsSaved(true)
  }

  // For some reason the `useStorage` hook above doesn't catch up with the real state from storage properly.
  // So we apply this hack to ensure the state is correctly synced with what's stored in storage.
  useEffect(() => {
    syncInputFields(settings)
  }, [settingsAsJson])

  return (
    <Form
      form={form}
      name={storageKeys.settings}
      layout="vertical"
      autoComplete="off"
      initialValues={toFieldType(settings)}
      onFinish={onFinish}
      style={{ padding: 10 }}>
      <Title level={1}>X Bot Sweeper Settings</Title>
      {isSaved && (
        <Alert message="Settings saved" type="success" showIcon closable />
      )}
      <p>Fine-tune the bot detection settings to your needs.</p>

      <Title level={3}>Following to Followers Ratio</Title>
      <Form.Item<FieldType>
        label="Ratio"
        name="ratio"
        rules={[{ required: true, message: "Please enter a ratio" }]}
        tooltip="The following to followers ratio is calculated as following /
          followers. You can use the calculator below."
        required>
        <InputNumber<string>
          placeholder={defaultSettings.rules.followingToFollowersRatio.toString()}
          min="0"
          step={1}
          stringMode
          required
          style={{ width: 200 }}
        />
      </Form.Item>

      {ratio < 10 && (
        <Alert
          message={`Attention! Small ratios can lead to false positives.${ratio == 0 ? " A ratio of 0 will match ALL YOUR FOLLOWERS, meaning the bot will BLOCK ALL OF THEM!" : ""} With great power comes great responsibility.`}
          type={"warning"}
          showIcon
          closable
        />
      )}

      <p>Calculate Ratio</p>
      <Flex gap={4}>
        <InputNumber<string>
          placeholder="Amount Following"
          min="0"
          step={1}
          stringMode
          style={{ width: 200 }}
          value={minFollowing}
          onChange={setMinFollowing}
        />
        <InputNumber<string>
          placeholder="Amount Followers"
          min="1"
          step={1}
          stringMode
          style={{ width: 200 }}
          value={minFollowers}
          onChange={setMinFollowers}
        />
        <Button
          onClick={() => {
            const ratio = parseFloat(minFollowing) / parseFloat(minFollowers)
            if (Number.isNaN(ratio) || !isFinite(ratio)) {
              return
            }
            form.setFieldsValue({ ratio: ratio.toString() })
          }}>
          Calculate
        </Button>
      </Flex>

      <Title level={3}>Banned keywords</Title>
      <Form.Item<FieldType>
        label="Keywords in Bio"
        name="bannedKeywords"
        tooltip="Separate keywords by a comma (,) and optionally followed by a space. Keywords are case sensitive.">
        <Input placeholder="OnlyFans, crypto, NFT" style={{ width: 400 }} />
      </Form.Item>

      <Title level={3}>Timeouts</Title>
      <Form.Item<FieldType>
        label="Block Timeout"
        name="blockTimeout"
        rules={[{ required: true, message: "Please enter a valid timeout" }]}
        tooltip="The time in milliseconds to wait between each block request."
        required>
        <InputNumber<number>
          placeholder={defaultSettings.timeouts.blockTimeout.toString()}
          min={500}
          step={500}
          required
          style={{ width: 200 }}
        />
      </Form.Item>
      <Form.Item<FieldType>
        label="My followers list timeout"
        name="myFollowersListTimeout"
        rules={[{ required: true, message: "Please enter a valid timeout" }]}
        tooltip="The time in milliseconds to wait between each 'scroll' to retrieve your complete followers list."
        required>
        <InputNumber<number>
          placeholder={defaultSettings.timeouts.myFollowersListTimeout.toString()}
          min={500}
          step={500}
          required
          style={{ width: 200 }}
        />
      </Form.Item>

      <Divider />

      <Flex style={{ marginTop: 10 }} gap={10}>
        <Button htmlType="submit">Save</Button>
        <Button onClick={reset} danger>
          Reset to default
        </Button>
      </Flex>
    </Form>
  )
}

export default OptionsIndex
