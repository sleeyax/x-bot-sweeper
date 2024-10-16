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

import { defaultRules, storageKeys, type Rules } from "~shared"

type FieldType = {
  ratio: string
  bannedKeywords?: string
}

function toFieldType(rules: Rules): FieldType {
  return {
    ratio: rules.followingToFollowersRatio.toString(),
    bannedKeywords: rules.bannedKeywords.join(", ")
  }
}

function OptionsIndex() {
  const [rulesAsJson, setRulesAsJson] = useStorage<string>(
    storageKeys.rules,
    (value) => {
      return value ?? JSON.stringify(defaultRules)
    }
  )
  const rules = useMemo<Rules>(() => JSON.parse(rulesAsJson), [rulesAsJson])
  const setRules = (rules: Rules) => setRulesAsJson(JSON.stringify(rules))
  const [isSaved, setIsSaved] = useState(false)
  const [form] = Form.useForm()
  const ratio = Form.useWatch("ratio", form)

  const syncInputFields = (rules: Rules) => {
    form.setFieldsValue(toFieldType(rules))
  }

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    const newRatio = parseFloat(values.ratio)
    if (Number.isNaN(newRatio)) {
      syncInputFields(rules)
      return
    }

    const newRules: Rules = {
      followingToFollowersRatio: newRatio,
      bannedKeywords: [
        ...new Set(
          (values.bannedKeywords ?? "")
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean)
        )
      ]
    }
    setRules(newRules)
    syncInputFields(newRules)
    setIsSaved(true)
  }

  const reset = () => {
    setRules(defaultRules)
    setIsSaved(true)
  }

  // For some reason the `useStorage` hook above doesn't catch up with the real state from storage properly.
  // So we apply this hack to ensure the state is correctly synced with what's stored in storage.
  useEffect(() => {
    syncInputFields(rules)
  }, [rulesAsJson])

  return (
    <Form
      form={form}
      name={storageKeys.rules}
      layout="vertical"
      autoComplete="off"
      initialValues={toFieldType(rules)}
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
        tooltip="The following to followers ratio (calculated as following /
          followers)."
        required>
        <InputNumber<string>
          placeholder={defaultRules.followingToFollowersRatio.toString()}
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

      <Title level={3}>Banned keywords</Title>
      <Form.Item<FieldType>
        label="Keywords in Bio"
        name="bannedKeywords"
        tooltip="Separate keywords by a comma (,) and optionally followed by a space. Keywords are case sensitive.">
        <Input placeholder="OnlyFans, crypto, NFT" style={{ width: 400 }} />
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
